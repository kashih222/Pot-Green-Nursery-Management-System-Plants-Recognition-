const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Plant = require('../../Models/Admin/plantUpload');
const upload = require('../../Middlewares/Admin/upload');
const plantController = require('../../Controllers/Admin/plantController');
const { isAuthenticatedUser, authorizeRoles } = require('../../Middlewares/Auth');
const { uploadFile, deleteFile } = require('../../Services/appwriteService');

// POST route to upload plant
router.post('/upload', upload.single('plantImage'), async (req, res) => {
  try {
    const { plantName, description, prices, category, stockQuantity, rating } = req.body;
    
    // Parse JSON strings for prices and stockQuantity
    const parsedPrices = JSON.parse(prices);
    const parsedStockQuantity = JSON.parse(stockQuantity);
    
    // Validate required fields
    if (!plantName || !prices || !category || !stockQuantity || !req.file) {
      console.error('Validation failed:', { 
        hasPlantName: !!plantName, 
        hasPrices: !!prices, 
        hasCategory: !!category, 
        hasStock: !!stockQuantity, 
        hasFile: !!req.file 
      });
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required and image must be uploaded.' 
      });
    }

    // Log file details for debugging
    console.log('Processing file upload:', {
      path: req.file.path,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Validate prices and stock quantities are valid numbers
    const validateSizeData = (data, fieldName) => {
      const sizes = ['small', 'medium', 'large'];
      for (const size of sizes) {
        if (!data[size] || isNaN(data[size]) || data[size] < 0) {
          throw new Error(`Invalid ${fieldName} for ${size} size`);
        }
      }
    };

    try {
      validateSizeData(parsedPrices, 'price');
      validateSizeData(parsedStockQuantity, 'stock quantity');
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Validate rating between 1-5
    const validatedRating = rating && rating >= 1 && rating <= 5 ? rating : 0;

    // Upload image to Appwrite
    let plantImage = null;
    if (req.file) {
      try {
        plantImage = await uploadFile(req.file.path, req.file.originalname);
      } catch (uploadError) {
        console.error('Appwrite upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          error: `Failed to upload image to storage: ${uploadError.message || uploadError}`,
          details: uploadError // Return full error for debugging
        });
      }
    }

    const newPlant = new Plant({
      plantName,
      description,
      prices: {
        small: parseFloat(parsedPrices.small),
        medium: parseFloat(parsedPrices.medium),
        large: parseFloat(parsedPrices.large)
      },
      category,
      stockQuantity: {
        small: parseInt(parsedStockQuantity.small),
        medium: parseInt(parsedStockQuantity.medium),
        large: parseInt(parsedStockQuantity.large)
      },
      plantImage,
      rating: validatedRating
    });

    await newPlant.save();

    res.status(201).json({ 
      success: true,
      message: 'Plant uploaded successfully', 
      plant: newPlant 
    });
  } catch (error) {
    console.error('Error uploading plant:', error);
    res.status(500).json({ 
      success: false,
      error: `Server error: ${error.message}` 
    });
  }
});

// GET route to fetch all plants
router.get('/all', async (req, res) => {
  try {
    const plants = await Plant.find().select('-__v'); // Exclude version key
    res.status(200).json({
      success: true,
      count: plants.length,
      data: plants
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching plants', 
      error: error.message 
    });
  }
});

// GET route to fetch total number of plants
router.get("/total", async (req, res) => {
  try {
    const count = await Plant.countDocuments();
    res.status(200).json({ 
      success: true,
      total: count 
    });
  } catch (error) {
    console.error("Count error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to count products" 
    });
  }
});

// POST route to validate multiple plant IDs
router.post('/validate', async (req, res) => {
  try {
    const { productIds } = req.body;

    // Validate input
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs'
      });
    }

    // Check if all IDs are valid MongoDB IDs
    const validIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid product IDs provided'
      });
    }

    // Find existing plants
    const existingPlants = await Plant.find({
      _id: { $in: validIds }
    }).select('_id stockQuantity');

    const existingProductIds = existingPlants.map(p => p._id.toString());
    const invalidProducts = productIds.filter(
      id => !existingProductIds.includes(id)
    );

    // Check stock availability
    const outOfStockProducts = existingPlants
      .filter(p => p.stockQuantity <= 0)
      .map(p => p._id.toString());

    res.json({
      success: true,
      valid: invalidProducts.length === 0 && outOfStockProducts.length === 0,
      invalidProducts,
      outOfStockProducts,
      existingProducts: existingPlants
    });

  } catch (error) {
    console.error('Product validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product validation',
      error: error.message
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE route to delete a plant
router.delete('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Delete image from Appwrite if it exists
    if (plant.plantImage) {
      try {
        await deleteFile(plant.plantImage);
      } catch (err) {
        console.error('Failed to delete image from Appwrite:', err);
        // Continue with deletion of plant record even if image delete fails
      }
    }

    await Plant.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plant',
      error: error.message
    });
  }
});

// PUT route to update a plant
router.put('/:id', upload.single('plantImage'), async (req, res) => {
  try {
    const plantId = req.params.id;

    // Find the plant first
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Prepare update object with only the fields that are provided
    const updateData = {};
    
    if (req.body.plantName) updateData.plantName = req.body.plantName;
    if (req.body.description) updateData.description = req.body.description;
    
    // Handle prices (could be JSON string or object)
    if (req.body.prices) {
      let prices = req.body.prices;
      if (typeof prices === 'string') {
        try {
          prices = JSON.parse(prices);
        } catch (e) {
          console.error('Error parsing prices:', e);
        }
      }
      
      updateData.prices = {
        small: parseFloat(prices.small),
        medium: parseFloat(prices.medium),
        large: parseFloat(prices.large)
      };
    }
    
    if (req.body.category) updateData.category = req.body.category;
    
    // Handle stockQuantity (could be JSON string or object)
    if (req.body.stockQuantity) {
      let stockQuantity = req.body.stockQuantity;
      if (typeof stockQuantity === 'string') {
        try {
          stockQuantity = JSON.parse(stockQuantity);
        } catch (e) {
          console.error('Error parsing stockQuantity:', e);
        }
      }

      updateData.stockQuantity = {
        small: parseInt(stockQuantity.small),
        medium: parseInt(stockQuantity.medium),
        large: parseInt(stockQuantity.large)
      };
    }
    
    if (req.body.rating) {
      const rating = parseFloat(req.body.rating);
      if (rating >= 1 && rating <= 5) {
        updateData.rating = rating;
      }
    }

    // If new image is uploaded, add it to update data and delete old one
    if (req.file) {
      try {
        // Upload new image
        const imageUrl = await uploadFile(req.file.path, req.file.originalname);
        updateData.plantImage = imageUrl;

        // Delete old image from Appwrite if it exists
        if (plant.plantImage) {
           await deleteFile(plant.plantImage);
        }
      } catch (uploadError) {
         console.error('Appwrite upload/delete failed during update:', uploadError);
         return res.status(500).json({
            success: false,
            error: `Failed to update image: ${uploadError.message}`
         });
      }
    }

    // Update the plant with only the changed fields
    const updatedPlant = await Plant.findByIdAndUpdate(
      plantId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Plant updated successfully',
      plant: updatedPlant
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plant',
      error: error.message
    });
  }
});

// Protected routes - only for admin
router.get(
  '/categories',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  plantController.getPlantsByCategory
);

router.get(
  '/category/:category',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  plantController.getPlantsBySpecificCategory
);

module.exports = router;