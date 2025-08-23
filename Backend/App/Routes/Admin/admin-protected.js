const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../Middelwares/Admin/authMiddleware');

router.get('/dashboard', protect, adminOnly, (req, res) => {
  res.json({ message: 'Welcome Admin Dashboard' });
});
