const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../Middlewares/Admin/authMiddleware');
const purchaseController = require('../../Controllers/Admin/purchaseController');

// All routes below require admin auth
router.use(protect, adminOnly);

// POST /api/purchases → Add a new purchase and update plant stock
router.post('/', purchaseController.createPurchase);

// GET /api/purchases → Fetch all purchase history with populated plant details
router.get('/', purchaseController.getPurchases);

// GET /api/purchases/pdf/:id → Download single purchase receipt
router.get('/pdf/:id', purchaseController.getPurchasePdf);

// GET /api/purchases/pdf/monthly/:year/:month → Download monthly report
router.get('/pdf/monthly/:year/:month', purchaseController.getMonthlyReportPdf);

module.exports = router;


