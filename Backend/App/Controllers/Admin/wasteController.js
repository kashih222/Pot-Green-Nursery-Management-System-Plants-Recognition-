const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Waste = require('../../Models/Admin/Waste');
const Plant = require('../../Models/Admin/plantUpload');

const WASTE_DIR = path.join(process.cwd(), 'uploads', 'waste');
if (!fs.existsSync(WASTE_DIR)) {
  fs.mkdirSync(WASTE_DIR, { recursive: true });
}

const formatDateTime = (d) => new Date(d).toLocaleString();

const generateWasteReceiptPdf = async ({ waste, plant }) => {
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `waste_${waste._id}.pdf`;
  const filePath = path.join(WASTE_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(20).text('Waste Receipt', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Waste ID: ${waste._id}`);
  doc.text(`Plant Name: ${plant.plantName}`);
  doc.text(`Size: ${waste.size}`);
  doc.text(`Quantity Wasted: ${waste.quantity}`);
  if (waste.reason) doc.text(`Reason: ${waste.reason}`);
  doc.text(`Date: ${formatDateTime(waste.createdAt || waste.date)}`);
  doc.moveDown();

  doc.text('Remaining Stock:', { underline: true });
  const sq = plant.stockQuantity || {};
  doc.text(`- Small: ${sq.small ?? 0}`);
  doc.text(`- Medium: ${sq.medium ?? 0}`);
  doc.text(`- Large: ${sq.large ?? 0}`);

  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${formatDateTime(new Date())}`, { align: 'right' });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return `/uploads/waste/${fileName}`;
};

const generateMonthlyWasteReportPdf = async ({ wastes }) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const fileName = `waste_report_${Date.now()}.pdf`;
  const filePath = path.join(WASTE_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(18).text('Monthly Waste Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text('Plant', 40, doc.y, { continued: true });
  doc.text('Size', 200, doc.y, { continued: true });
  doc.text('Qty', 260, doc.y, { continued: true });
  doc.text('Reason', 310, doc.y, { continued: true });
  doc.text('Date', 460, doc.y);
  doc.moveTo(40, doc.y + 2).lineTo(560, doc.y + 2).stroke();
  doc.moveDown(0.5);

  wastes.forEach(w => {
    const y = doc.y;
    doc.text(w.plantId?.plantName || 'N/A', 40, y, { width: 140, continued: true });
    doc.text(w.size, 200, y, { width: 50, continued: true });
    doc.text(String(w.quantity), 260, y, { width: 40, continued: true });
    doc.text(w.reason || '-', 310, y, { width: 140, continued: true });
    doc.text(formatDateTime(w.createdAt || w.date), 460, y, { width: 120 });
  });

  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${formatDateTime(new Date())}`, { align: 'right' });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return `/uploads/waste/${fileName}`;
};

exports.createWaste = async (req, res) => {
  try {
    const { plantId, reason, size, quantity } = req.body;

    if (!plantId || !size || !quantity) {
      return res.status(400).json({ success: false, message: 'plantId, size, and quantity are required' });
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

    const current = plant.stockQuantity?.[size] || 0;
    if (qty > current) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available ${size}: ${current}` });
    }

    const updatedPlant = await Plant.findByIdAndUpdate(
      plantId,
      { $inc: { [`stockQuantity.${size}`]: -qty } },
      { new: true }
    );

    const waste = await Waste.create({ plantId, reason: reason || '', size, quantity: qty });
    const populatedWaste = await waste.populate('plantId');

    const pdfPath = await generateWasteReceiptPdf({ waste: populatedWaste, plant: updatedPlant });

    return res.status(201).json({
      success: true,
      message: 'Waste recorded and plant stock updated',
      data: {
        waste: populatedWaste,
        plant: updatedPlant,
        pdf: pdfPath
      }
    });
  } catch (err) {
    console.error('Create Waste Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create waste', error: err.message });
  }
};

exports.getWaste = async (req, res) => {
  try {
    const wastes = await Waste.find().sort({ createdAt: -1 }).populate('plantId');
    return res.status(200).json({ success: true, data: wastes });
  } catch (err) {
    console.error('Get Waste Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch waste records', error: err.message });
  }
};

exports.getWastePdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid waste id' });
    }
    const waste = await Waste.findById(id).populate('plantId');
    if (!waste) {
      return res.status(404).json({ success: false, message: 'Waste not found' });
    }
    const plant = await Plant.findById(waste.plantId._id);
    const filePath = await generateWasteReceiptPdf({ waste, plant });
    const absPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=waste_${waste._id}.pdf`);
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    console.error('Get Waste PDF Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF', error: err.message });
  }
};

exports.getMonthlyWasteReportPdf = async (req, res) => {
  try {
    const { year, month } = req.params;
    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: 'Invalid year or month' });
    }
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const wastes = await Waste.find({ createdAt: { $gte: start, $lt: end } }).sort({ createdAt: -1 }).populate('plantId');
    const filePath = await generateMonthlyWasteReportPdf({ wastes });
    const absPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=waste_report_${year}_${month}.pdf`);
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    console.error('Get Monthly Waste Report PDF Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate monthly waste report', error: err.message });
  }
};


