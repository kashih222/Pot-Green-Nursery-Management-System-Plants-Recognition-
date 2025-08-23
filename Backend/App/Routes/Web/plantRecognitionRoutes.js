const express = require('express');
const router = express.Router();
const { recognizePlant } = require('../../Controllers/Web/plantRecognitionController');

// Plant recognition route
router.post('/recognize', recognizePlant);

module.exports = router; 