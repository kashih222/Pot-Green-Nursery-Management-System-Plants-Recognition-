const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Load plant class names from JSON
const plantClassNames = require('../../../plants_names.json');

// Multer setup for storing uploads
const storage = multer.diskStorage({
  destination: 'uploads/recognition/',
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Plant recognition endpoint
const recognizePlant = async (req, res) => {
  try {
    // Use multer to handle file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload error' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      try {
        const form = new FormData();
        form.append("image", fs.createReadStream(req.file.path), {
          filename: req.file.originalname || "upload.jpg"
        });

        // Forward to Flask API
        const flaskRes = await axios.post("http://localhost:9080/predict", form, {
          headers: form.getHeaders(),
        });

        console.log("Prediction array:", flaskRes.data);

        // Get top 3 predictions with highest probabilities
        const probabilities = flaskRes.data.probabilities;
        const top3Predictions = [];
        
        // Create array of [index, probability] pairs
        const predictionsWithIndex = probabilities.map((prob, index) => [index, prob]);
        
        // Sort by probability (descending) and take top 3
        predictionsWithIndex.sort((a, b) => b[1] - a[1]);
        const top3 = predictionsWithIndex.slice(0, 3);
        
        // Format top 3 results
        top3.forEach(([index, probability]) => {
          top3Predictions.push({
            index: index,
            name: plantClassNames[index] || "Unknown Plant",
            probability: probability,
            confidence: (probability * 100).toFixed(1)
          });
        });

        // Create image URL
        const uploadedImageURL = `http://localhost:8020/uploads/${req.file.filename}`;

        res.json({
          success: true,
          topPredictions: top3Predictions,
          uploadedImage: uploadedImageURL,
          probabilities: flaskRes.data.probabilities
        });

        // Optional: delete file after sending
        // fs.unlinkSync(req.file.path);

      } catch (error) {
        console.error("Prediction error:", error.message);
        res.status(500).json({ 
          success: false,
          error: "Plant recognition failed. Please try again." 
        });
      }
    });

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

module.exports = {
  recognizePlant
}; 