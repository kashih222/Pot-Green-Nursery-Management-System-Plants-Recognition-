const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../Middlewares/Admin/authMiddleware');
const wasteController = require('../../Controllers/Admin/wasteController');

router.use(protect, adminOnly);

router.post('/', wasteController.createWaste);
router.get('/', wasteController.getWaste);
router.get('/pdf/:id', wasteController.getWastePdf);
router.get('/pdf/monthly/:year/:month', wasteController.getMonthlyWasteReportPdf);

module.exports = router;


