const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Purchase = require('../../Models/Admin/Purchase');
const Plant = require('../../Models/Admin/plantUpload');

const PURCHASES_DIR = path.join('/tmp', 'uploads', 'purchases');
if (!fs.existsSync(PURCHASES_DIR)) {
  fs.mkdirSync(PURCHASES_DIR, { recursive: true });
}
console.log(PURCHASES_DIR);
const formatDateTime = (d) => new Date(d).toLocaleString();

const generateReceiptPdf = async ({ purchase, plant }) => {
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `purchase_${purchase._id}.pdf`;
  const filePath = path.join(PURCHASES_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Title
  doc.fontSize(20).text('Purchase Receipt', { align: 'center' });
  doc.moveDown();

  // Details
  doc.fontSize(12);
  doc.text(`Purchase ID: ${purchase._id}`);
  doc.text(`Plant Name: ${plant.plantName}`);
  doc.text(`Nursery: ${purchase.nurseryName}`);
  doc.text(`Size: ${purchase.size}`);
  doc.text(`Quantity: ${purchase.quantity}`);
  doc.text(`Date: ${formatDateTime(purchase.createdAt || purchase.date)}`);
  doc.moveDown();

  // Updated stock
  doc.text('Updated Stock:', { underline: true });
  const sq = plant.stockQuantity || {};
  doc.text(`- Small: ${sq.small ?? 0}`);
  doc.text(`- Medium: ${sq.medium ?? 0}`);
  doc.text(`- Large: ${sq.large ?? 0}`);

  // Footer
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${formatDateTime(new Date())}`, { align: 'right' });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath; // Return the full temporary path
};

const generateMonthlyReportPdf = async ({ purchases }) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const fileName = `purchase_report_${Date.now()}.pdf`;
  const filePath = path.join(PURCHASES_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Title
  doc.fontSize(18).text('Monthly Purchase Report', { align: 'center' });
  doc.moveDown();

  // Table header
  doc.fontSize(12).text('Plant', 40, doc.y, { continued: true });
  doc.text('Nursery', 160, doc.y, { continued: true });
  doc.text('Size', 300, doc.y, { continued: true });
  doc.text('Qty', 360, doc.y, { continued: true });
  doc.text('Date', 410, doc.y);
  doc.moveTo(40, doc.y + 2).lineTo(560, doc.y + 2).stroke();
  doc.moveDown(0.5);

  purchases.forEach(p => {
    const y = doc.y;
    doc.text(p.plantId?.plantName || 'N/A', 40, y, { width: 110, continued: true });
    doc.text(p.nurseryName, 160, y, { width: 130, continued: true });
    doc.text(p.size, 300, y, { width: 50, continued: true });
    doc.text(String(p.quantity), 360, y, { width: 40, continued: true });
    doc.text(formatDateTime(p.createdAt || p.date), 410, y, { width: 150 });
  });

  // Footer
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${formatDateTime(new Date())}`, { align: 'right' });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath; // Return full temp path
};

exports.createPurchase = async (req, res) => {
  try {
    const { plantId, nurseryName, size, quantity } = req.body;

    if (!plantId || !nurseryName || !size || !quantity) {
      return res.status(400).json({ success: false, message: 'plantId, nurseryName, size, and quantity are required' });
    }

    if (!['small', 'medium', 'large'].includes(size)) {
      return res.status(400).json({ success: false, message: 'Invalid size. Allowed: small, medium, large' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'quantity must be a positive number' });
    }

    if (!mongoose.Types.ObjectId.isValid(plantId)) {
      return res.status(400).json({ success: false, message: 'Invalid plantId' });
    }

    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    // Increment the stockQuantity for the specified size atomically
    const updatedPlant = await Plant.findByIdAndUpdate(
      plantId,
      { $inc: { [`stockQuantity.${size}`]: qty } },
      { new: true }
    );

    // Create purchase record
    const purchase = await Purchase.create({
      plantId,
      nurseryName,
      size,
      quantity: qty
    });

    const populatedPurchase = await purchase.populate('plantId');

    // Generate receipt PDF
    const pdfPath = await generateReceiptPdf({ purchase: populatedPurchase, plant: updatedPlant });

    return res.status(201).json({
      success: true,
      message: 'Purchase recorded and plant stock updated',
      data: {
        purchase: populatedPurchase,
        plant: updatedPlant,
        pdf: pdfPath
      }
    });
  } catch (err) {
    console.error('Create Purchase Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create purchase', error: err.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate('plantId');

    return res.status(200).json({ success: true, data: purchases });
  } catch (err) {
    console.error('Get Purchases Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch purchases', error: err.message });
  }
};

exports.getPurchasePdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid purchase id' });
    }
    const purchase = await Purchase.findById(id).populate('plantId');
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    const filePath = await generateReceiptPdf({ purchase, plant: await Plant.findById(purchase.plantId._id) });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase_${purchase._id}.pdf`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Get Purchase PDF Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF', error: err.message });
  }
};

exports.getMonthlyReportPdf = async (req, res) => {
  try {
    const { year, month } = req.params;
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: 'Invalid year or month' });
    }

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const purchases = await Purchase.find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .populate('plantId');

    const filePath = await generateMonthlyReportPdf({ purchases });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase_report_${year}_${month}.pdf`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Get Monthly Report PDF Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate monthly report', error: err.message });
  }
};
