import express from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Parser as Json2CsvParser } from 'json2csv';
import { put, del } from '@vercel/blob';

import Medication from '../models/Medication.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';


const router = express.Router();

const REPORTS_DIR = path.resolve(process.cwd(), 'uploads', 'reports');
fs.mkdirSync(REPORTS_DIR, { recursive: true });

function scopeFilter(req) {
    return req.user.orgId ? { orgId: req.user.orgId } : { addedBy: req.user.userId };
}

function parseDateRange(dateFilter = '') {
    const now = new Date();
    const to = new Date(now);
    const lower = String(dateFilter || '').toLowerCase();
    let from = null;

    const setFromDays = (days) => {
        from = new Date(now);
        from.setDate(from.getDate() - days);
    };

    if (!lower || lower === 'all' || lower === 'all time') {
        return { from: null, to };
    }

    if (lower.includes('30')) setFromDays(30);
    else if (lower.includes('60')) setFromDays(60);
    else if (lower.includes('90')) setFromDays(90);
    else if (lower.includes('6')) setFromDays(183);
    else if (lower.includes('year')) setFromDays(365);
    else setFromDays(60);

    return { from, to };
}

function safeFileName(name) {
    return String(name).replace(/[^a-z0-9\-_\.]/gi, '_');
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

async function getCurrentUser(req) {
    return User.findById(req.user.userId).select('name email').lean();
}

async function buildReportData({ req, reportType, reportSubType, filters }) {
    const base = scopeFilter(req);
    const now = new Date();

    const search = String(filters.search || '').trim();
    const category = String(filters.category || '').trim();
    const status = String(filters.status || '').trim();

    const q = { ...base };

    if (search) {
        q.$or = [
            { medicationName: { $regex: search, $options: 'i' } },
            { brandName: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { batchLotNumber: { $regex: search, $options: 'i' } },
        ];
    }

    if (category && category !== 'All') q.category = category;
    if (status && status !== 'All') q.status = status;

    const { from, to } = parseDateRange(filters.dateFilter);
    if (from) q.createdAt = { $gte: from, $lte: to };

    if (reportType === 'Expiry Reports') {
        const windowDays = Number(filters.expiryWindowDays || 60);
        const until = new Date(now);
        until.setDate(until.getDate() + (Number.isFinite(windowDays) ? windowDays : 60));

        if (reportSubType === 'expired') {
            q.status = 'Expired';
        } else {
            q.expiryDate = { $ne: null, $lte: until };
            q.status = { $nin: ['Removed'] };
        }

        const rows = await Medication.find(q).sort({ expiryDate: 1, medicationName: 1 }).lean();
        return { kind: 'table', rows };
    }

    if (reportType === 'Stock Reports') {
        if (reportSubType === 'out_of_stock') {
            q.status = 'Out of Stock';
        } else if (reportSubType === 'low_stock') {
            q.status = 'Low Stock';
        }

        const rows = await Medication.find(q).sort({ currentStock: 1, medicationName: 1 }).lean();
        return { kind: 'table', rows };
    }

    if (reportType === 'Compliance & Safety Reports') {
        if (reportSubType === 'removed_expired') {
            q.status = 'Removed';
            q.expiryDate = { $ne: null, $lt: now };
        } else {
            q.status = { $in: ['Expired', 'Recalled', 'Expiring Soon'] };
        }

        const rows = await Medication.find(q).sort({ status: 1, expiryDate: 1 }).lean();
        return { kind: 'table', rows };
    }

    if (reportType === 'Usage & Trends') {
        const trendRangeDays = Number(filters.trendWindowDays || 365);
        const fromD = new Date(now);
        fromD.setDate(fromD.getDate() - (Number.isFinite(trendRangeDays) ? trendRangeDays : 365));

        const match = {
            ...base,
            expiryDate: { $ne: null, $gte: fromD, $lte: now },
        };

        const expiredWasteOverTime = await Medication.aggregate([
            { $match: { ...match, status: 'Expired' } },
            {
                $group: {
                    _id: { y: { $year: '$expiryDate' }, m: { $month: '$expiryDate' } },
                    itemsExpired: { $sum: 1 },
                    unitsExpired: { $sum: '$currentStock' },
                },
            },
            { $sort: { '_id.y': 1, '_id.m': 1 } },
            {
                $project: {
                    _id: 0,
                    period: {
                        $concat: [
                            { $toString: '$_id.y' },
                            '-',
                            {
                                $cond: [{ $lte: ['$_id.m', 9] }, { $concat: ['0', { $toString: '$_id.m' }] }, { $toString: '$_id.m' }],
                            },
                        ],
                    },
                    itemsExpired: 1,
                    unitsExpired: 1,
                },
            },
        ]);

        const mostExpiredItems = await Medication.aggregate([
            { $match: { ...match, status: 'Expired' } },
            {
                $group: {
                    _id: '$medicationName',
                    timesExpired: { $sum: 1 },
                },
            },
            { $sort: { timesExpired: -1 } },
            { $limit: 20 },
            { $project: { _id: 0, medicationName: '$_id', timesExpired: 1 } },
        ]);

        return {
            kind: 'summary',
            expiredWasteOverTime,
            mostExpiredItems,
        };
    }

    const rows = await Medication.find(q).sort({ createdAt: -1 }).limit(200).lean();
    return { kind: 'table', rows };
}



function normalizeRowsForExport(reportType, data) {
    if (data.kind === 'table') {
        return data.rows.map((r) => ({
            medicationName: r.medicationName,
            brandName: r.brandName,
            category: r.category,
            sku: r.sku,
            batchLotNumber: r.batchLotNumber,
            risk: r.risk,
            shelfId: r.shelfId,
            expiryDate: r.expiryDate ? new Date(r.expiryDate).toISOString().slice(0, 10) : '',
            currentStock: r.currentStock,
            status: r.status,
            supplierName: r.supplierName,
        }));
    }

    return [
        {
            reportType,
            expiredWasteOverTime: JSON.stringify(data.expiredWasteOverTime || []),
            mostExpiredItems: JSON.stringify(data.mostExpiredItems || []),
        },
    ];
}

function writeCsvFile(filePath, rows) {
    const parser = new Json2CsvParser({ withBOM: true });
    const csv = parser.parse(rows);
    fs.writeFileSync(filePath, csv);
}

function writePdfFile(filePath, { title, meta, rows, summary }) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text(title, { bold: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555');

    Object.entries(meta || {}).forEach(([k, v]) => {
        doc.text(`${k}: ${v}`);
    });

    doc.fillColor('#000');
    doc.moveDown();

    if (rows && rows.length) {
        doc.fontSize(12).text('Results');
        doc.moveDown(0.5);

        rows.slice(0, 500).forEach((r, idx) => {
            doc.fontSize(10).text(
                `${idx + 1}. ${r.medicationName || ''} | ${r.brandName || ''} | ${r.category || ''} | Stock: ${r.currentStock ?? ''} | Exp: ${r.expiryDate || ''} | ${r.status || ''}`,
            );
        });

        if (rows.length > 500) {
            doc.moveDown(0.5);
            doc.fontSize(9).fillColor('#777').text(`(Showing first 500 rows. Total: ${rows.length})`);
            doc.fillColor('#000');
        }
    }

    if (summary) {
        doc.moveDown();
        doc.fontSize(12).text('Summary');
        doc.moveDown(0.5);
        doc.fontSize(10).text('Expired waste over time:');
        doc.fontSize(9).text(JSON.stringify(summary.expiredWasteOverTime || [], null, 2));
        doc.moveDown(0.5);
        doc.fontSize(10).text('Most expired items:');
        doc.fontSize(9).text(JSON.stringify(summary.mostExpiredItems || [], null, 2));
    }

    doc.end();
}

async function saveReportFile(fileName, contentType, buffer) {
    if (process.env.VERCEL) {
        // Vercel Blob path
        const blob = await put(fileName, buffer, {
            access: 'public',
            contentType: contentType,
        });
        return blob.url;
    } else {
        // Local path
        const REPORTS_DIR = path.resolve(process.cwd(), 'uploads', 'reports');
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }        
        const fullDirPath = path.join(REPORTS_DIR, 'reportsGenerated');
        if (!fs.existsSync(fullDirPath)) {
            fs.mkdirSync(fullDirPath, { recursive: true });
        }
        
        const filePath = path.join(REPORTS_DIR, fileName);
        fs.writeFileSync(filePath, buffer);
        return `/files/reports/${encodeURIComponent(fileName)}`;
    }
}
// POST /api/reports/generate
router.post('/generate', verifyToken, async (req, res) => {
try {
const { reportType, reportSubType = '', format, filters = {} } = req.body || {};
if (!reportType || !format) {
        return res.status(400).json({ success: false, message: 'reportType and format are required' });
    }

    if (!['PDF', 'CSV'].includes(format)) {
        return res.status(400).json({ success: false, message: 'format must be PDF or CSV' });
    }

    const currentUser = await getCurrentUser(req);
    const data = await buildReportData({ req, reportType, reportSubType, filters });
    const exportRows = normalizeRowsForExport(reportType, data);

    const ts = Date.now();
    const folderPath = 'reportsGenerated';
    const fileName = `${folderPath}/${safeFileName(reportType)}_${ts}.${format === 'PDF' ? 'pdf' : 'csv'}`;
    const contentType = format === 'PDF' ? 'application/pdf' : 'text/csv';


    let fileBuffer;
    let publicUrl;

    if (format === 'CSV') {
        const parser = new Json2CsvParser({ withBOM: true });
        fileBuffer = Buffer.from(parser.parse(exportRows), 'utf-8');
    } else {
        // PDF Generation
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});

        doc.fontSize(18).text(`ShelfSafe — ${reportType}`, { bold: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#555');

        Object.entries({
            Created: new Date().toISOString(),
            'Report Type': reportType,
            'Report Subtype': reportSubType || 'default',
            'Generated By': currentUser?.email || 'Unknown',
        }).forEach(([k, v]) => doc.text(`${k}: ${v}`));

        doc.fillColor('#000').moveDown();

        if (data.kind === 'table' && exportRows.length) {
            doc.fontSize(12).text('Results');
            doc.moveDown(0.5);
            exportRows.slice(0, 500).forEach((r, idx) => {
                doc.fontSize(10).text(
                    `${idx + 1}. ${r.medicationName || ''} | Stock: ${r.currentStock ?? ''} | Exp: ${r.expiryDate || ''}`
                );
            });
        }

        if (data.kind === 'summary') {
            doc.moveDown();
            doc.fontSize(12).text('Summary');
            doc.fontSize(9).text(JSON.stringify(data, null, 2));
        }

        doc.end();
        await new Promise((resolve) => doc.on('end', resolve));
        fileBuffer = Buffer.concat(buffers);
    }

    // Upload to Vercel Blob
    const blob = await put(fileName, fileBuffer, {
        access: 'public',
        contentType: contentType,
    });
    publicUrl = blob.url;

    const reportDoc = await Report.create({
        orgId: req.user.orgId || 'dummy01',
        reportType,
        reportSubType,
        filters,
        generatedBy: req.user.userId,
        format,
        fileUrl: publicUrl,
        fileName,
        mimeType: contentType,
        recordCount: data.kind === 'table' ? data.rows.length : exportRows.length,
    });

    res.status(201).json({
        success: true,
        report: {
            id: reportDoc._id,
            type: reportDoc.reportType,
            subType: reportDoc.reportSubType,
            format: reportDoc.format,
            dateCreated: formatDate(reportDoc.createdAt),
            createdAt: reportDoc.createdAt,
            createdBy: currentUser?.email || 'Unknown',
            author: currentUser?.name || currentUser?.email || 'Unknown',
            fileUrl: reportDoc.fileUrl,
            rowCount: reportDoc.recordCount,
        },
    });
} catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
}
});

// POST /api/reports/generate
//origin by jeff
// router.post('/generate', verifyToken, async (req, res) => {
//     try {
//         const { reportType, reportSubType = '', format, filters = {} } = req.body || {};

//         if (!reportType || !format) {
//             return res.status(400).json({ success: false, message: 'reportType and format are required' });
//         }

//         if (!['PDF', 'CSV'].includes(format)) {
//             return res.status(400).json({ success: false, message: 'format must be PDF or CSV' });
//         }

//         const currentUser = await getCurrentUser(req);
//         const data = await buildReportData({ req, reportType, reportSubType, filters });
//         const exportRows = normalizeRowsForExport(reportType, data);

//         const ts = Date.now();
//         const baseName = safeFileName(`${reportType}_${reportSubType || 'default'}_${ts}`);
//         const fileName = `${baseName}.${format === 'PDF' ? 'pdf' : 'csv'}`;
//         const filePath = path.join(REPORTS_DIR, fileName);

//         const meta = {
//             Created: new Date().toISOString(),
//             'Report Type': reportType,
//             'Report Subtype': reportSubType || 'default',
//             'Generated By': currentUser?.email || 'Unknown',
//         };

//         if (format === 'CSV') {
//             writeCsvFile(filePath, exportRows);
//         } else {
//             writePdfFile(filePath, {
//                 title: `ShelfSafe — ${reportType}`,
//                 meta,
//                 rows: data.kind === 'table' ? exportRows : null,
//                 summary: data.kind === 'summary' ? data : null,
//             });
//         }

//         const publicUrl = `${req.protocol}://${req.get('host')}/files/reports/${encodeURIComponent(fileName)}`;

//         const reportDoc = await Report.create({
//             orgId: req.user.orgId || 'dummy01',
//             reportType,
//             reportSubType,
//             filters,
//             generatedBy: req.user.userId,
//             format,
//             fileUrl: publicUrl,
//             fileName,
//             mimeType: format === 'PDF' ? 'application/pdf' : 'text/csv',
//             recordCount: data.kind === 'table' ? data.rows.length : exportRows.length,
//         });

//         res.status(201).json({
//             success: true,
//             report: {
//                 id: reportDoc._id,
//                 type: reportDoc.reportType,
//                 subType: reportDoc.reportSubType,
//                 format: reportDoc.format,
//                 dateCreated: formatDate(reportDoc.createdAt),
//                 createdAt: reportDoc.createdAt,
//                 createdBy: currentUser?.email || 'Unknown',
//                 author: currentUser?.name || currentUser?.email || 'Unknown',
//                 fileUrl: reportDoc.fileUrl,
//                 rowCount: reportDoc.recordCount,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

// GET /api/reports
router.get('/', verifyToken, async (req, res) => {
    try {
        const { q = '', dateFilter = 'Last 60 days', reportType = '', format = '' } = req.query;
        const scope = req.user.orgId ? { orgId: req.user.orgId } : { generatedBy: req.user.userId };
        const filter = { ...scope };

        if (reportType && reportType !== 'All') filter.reportType = reportType;
        if (format && format !== 'All Formats' && format !== 'All') filter.format = format;

        const { from, to } = parseDateRange(dateFilter);
        if (from) filter.createdAt = { $gte: from, $lte: to };

        let reports = await Report.find(filter).sort({ createdAt: -1 }).limit(200).lean();

        const userIds = [...new Set(reports.map((r) => String(r.generatedBy)))];
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email')
            .lean();
        const byId = new Map(users.map((u) => [String(u._id), u]));

        reports = reports.map((r) => {
            const u = byId.get(String(r.generatedBy));
            return {
                id: r._id,
                type: r.reportType,
                subType: r.reportSubType,
                dateCreated: formatDate(r.createdAt),
                createdAt: r.createdAt,
                createdBy: u?.email || 'User',
                author: u?.name || u?.email || 'User',
                format: r.format,
                fileUrl: r.fileUrl,
                rowCount: r.recordCount,
            };
        });

        const term = String(q || '')
            .trim()
            .toLowerCase();
        if (term) {
            reports = reports.filter((r) =>
                [r.type, r.subType, r.createdBy, r.author, r.format].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)),
            );
        }

        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/reports/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const scope = req.user.orgId ? { orgId: req.user.orgId } : { generatedBy: req.user.userId };
        const report = await Report.findOne({ _id: req.params.id, ...scope }).lean();

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/reports/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const scope = req.user.orgId ? { orgId: req.user.orgId } : { generatedBy: req.user.userId };
        const report = await Report.findOneAndDelete({ _id: req.params.id, ...scope });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        try {
            if (process.env.VERCEL) {
                await del(report.fileUrl);
            } else {
                const REPORTS_DIR = path.resolve(process.cwd(), 'uploads', 'reports');
                const filePath = path.join(REPORTS_DIR, report.fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (err) {
            console.error("Failed to delete file:", err);
        }

        res.json({ success: true, message: 'Report deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//origin jeff
// DELETE /api/reports/:id
// router.delete('/:id', verifyToken, async (req, res) => {
//     try {
//         const scope = req.user.orgId ? { orgId: req.user.orgId } : { generatedBy: req.user.userId };
//         const report = await Report.findOneAndDelete({ _id: req.params.id, ...scope });

//         if (!report) {
//             return res.status(404).json({ success: false, message: 'Report not found' });
//         }

//         try {
//             const filePath = path.join(REPORTS_DIR, report.fileName);
//             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//         } catch (_) {}

//         res.json({ success: true, message: 'Report deleted' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// });


// export report file functionality through nodemailer -Dalbir

// POST /api/reports/:id/share
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const { recipientEmail } = req.body || {};

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return res.status(400).json({ success: false, message: 'A valid recipientEmail is required.' });
    }

    const scope = req.user.orgId ? { orgId: req.user.orgId } : { generatedBy: req.user.userId };
    const report = await Report.findOne({ _id: req.params.id, ...scope }).lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const sender = await getCurrentUser(req);
    const fileExtension = report.format === 'PDF' ? 'pdf' : 'csv';
    const attachmentName = `${safeFileName(report.reportType)}_report.${fileExtension}`;

    let attachments;

    if (process.env.VERCEL) {
      const response = await fetch(report.fileUrl);
      if (!response.ok) {
        return res.status(502).json({ success: false, message: 'Could not fetch the report file for attachment.' });
      }
      const arrayBuffer = await response.arrayBuffer();
      attachments = [{
        filename: attachmentName,
        content: Buffer.from(arrayBuffer),
        contentType: report.mimeType,
      }];
    } else {
      const REPORTS_DIR_LOCAL = path.resolve(process.cwd(), 'uploads', 'reports');
      const filePath = path.join(REPORTS_DIR_LOCAL, report.fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Report file not found on disk.' });
      }
      attachments = [{
        filename: attachmentName,
        path: filePath,
        contentType: report.mimeType,
      }];
    }

    await sendEmail({
      to: recipientEmail,
      subject: `ShelfSafe Report: ${report.reportType}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#00808d;">ShelfSafe Report</h2>
          <p>Hi,</p>
          <p><strong>${sender?.name || sender?.email || 'A team member'}</strong> has shared a <strong>${report.reportType}</strong> report with you.</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:14px;">
            <tr><td style="padding:6px 12px;background:#f4f4f4;font-weight:600;">Report Type</td><td style="padding:6px 12px;">${report.reportType}</td></tr>
            <tr><td style="padding:6px 12px;background:#f4f4f4;font-weight:600;">Format</td><td style="padding:6px 12px;">${report.format}</td></tr>
            <tr><td style="padding:6px 12px;background:#f4f4f4;font-weight:600;">Records</td><td style="padding:6px 12px;">${report.recordCount ?? 'N/A'}</td></tr>
            <tr><td style="padding:6px 12px;background:#f4f4f4;font-weight:600;">Generated</td><td style="padding:6px 12px;">${new Date(report.createdAt).toLocaleString()}</td></tr>
          </table>
          <p>The report is attached to this email as <strong>${attachmentName}</strong>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:12px;color:#888;">This email was sent from ShelfSafe. Please do not reply.</p>
        </div>
      `,
      attachments,
    });

    res.json({ success: true, message: `Report sent to ${recipientEmail}` });
  } catch (error) {
    console.error('Report Share Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
