import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import medicationRoutes from './routes/medications.js';
import profileRoutes from './routes/profile.js';
import posRoutes from './routes/pos.js';
import reportRoutes from './routes/reports.js';

import multer from 'multer';
import * as xlsx from 'xlsx';
import Medication from './models/Medication.js';

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const posLogosPath = path.resolve(__dirname, '..', 'frontend', 'src', 'assets', 'pos');
app.use('/pos-logos', express.static(posLogosPath));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));


// Bulk Import Route
app.post('/api/medications/bulk-import', upload.single('file'), async (req, res) => {
  try {
    // 1. Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // 2. Read the file from the memory buffer using xlsx
    // raw: false ensures Excel dates are converted to readable strings
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded file is empty.' });
    }

    // 3. Map the Excel columns to your MongoDB Schema
    // This looks at common column names users might put in their Excel file
    const medicationsToInsert = rawData.map((row) => {
      return {
        medicationName: row['Medication Name'] || row['Name'] || row.medicationName || 'Unknown',
        brandName: row['Brand Name'] || row['Brand'] || row.brandName || '',
        sku: row['SKU'] || row['Barcode'] || row.sku || '',
        batchLotNumber: row['Batch Number'] || row['Lot Number'] || row.batchLotNumber || '',
        category: row['Category'] || row.category || 'Other',
        supplierName: row['Supplier'] || row['Supplier Name'] || row.supplierName || '',
        supplierContact: row['Supplier Contact'] || row.supplierContact || '',
        status: row['Status'] || row.status || 'In Stock',
        risk: row['Risk'] || row.risk || 'Low',
        shelfId: row['Shelf ID'] || row['Location'] || row.shelfId || '',

        // Ensure stock is saved as a number
        currentStock: parseInt(row['Current Stock'] || row['Quantity'] || row.currentStock, 10) || 0,

        // Expiry handling
        expiryDate: row['Expiry Date'] || row.expiryDate || '',
        expiryMonth: row['Expiry Month'] || row.expiryMonth || '',
        expiryYear: row['Expiry Year'] || row.expiryYear || ''
      };
    });

    // 4. Save all mapped items to MongoDB at once
    const insertedItems = await Medication.insertMany(medicationsToInsert);

    // 5. Return success response formatted exactly how the React frontend expects it
    res.status(200).json({
      success: true,
      message: `Successfully imported ${insertedItems.length} medications.`,
      data: {
        items: insertedItems
      }
    });

  } catch (error) {
    console.error('Bulk Import Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk import. Please check file format.',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

const reportsPath = path.resolve(process.cwd(), 'uploads', 'reports');
app.use('/files/reports', express.static(reportsPath));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
