import express from 'express';
import Medication from '../models/Medication.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { type, format } = req.body;

    if (!type || !format) {
      return res.status(400).json({ success: false, message: 'type and format are required' });
    }

    const userId = req.user.userId;
    const today  = new Date();
    let data     = [];

    if (type === 'Expiry Reports') {
      const in90 = new Date(); in90.setDate(today.getDate() + 90);
      data = await Medication.find({
        addedBy: userId,
        expiryDate: { $lte: in90 },
      }).sort({ expiryDate: 1 }).lean();

    } else if (type === 'Stock Reports') {
      data = await Medication.find({
        addedBy: userId,
        $or: [
          { status: 'Low Stock' },
          { status: 'Out of Stock' },
        ],
      }).sort({ currentStock: 1 }).lean();

    } else if (type === 'Compliance & Safety Reports') {
      data = await Medication.find({
        addedBy: userId,
        status: { $in: ['Expired', 'Recalled', 'Expiring Soon'] },
      }).sort({ expiryDate: 1 }).lean();

    } else if (type === 'Usage & Trends') {
      data = await Medication.find({ addedBy: userId })
        .sort({ currentStock: -1 })
        .limit(50)
        .lean();

    } else {
      return res.status(400).json({ success: false, message: 'Unknown report type' });
    }
    const report = {
      id: `rpt_${Date.now()}`,
      type,
      format,
      dateCreated: today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      createdBy: req.user.email || 'User',
      rowCount: data.length,
      data,
    };

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
