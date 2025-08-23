const express = require('express');
const router = express.Router();
const { loginUser, logout } = require('../../Controllers/Admin/authController');

router.post('/login', loginUser);
router.get('/logouted', logout); 

module.exports = router;