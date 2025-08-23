const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  plantName: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  prices: {
    small: {
      type: Number,
      required: [true, 'Small size price is required'],
      min: [0, 'Price cannot be negative']
    },
    medium: {
      type: Number,
      required: [true, 'Medium size price is required'],
      min: [0, 'Price cannot be negative']
    },
    large: {
      type: Number,
      required: [true, 'Large size price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  stockQuantity: {
    small: {
      type: Number,
      required: [true, 'Small size stock is required'],
      min: [0, 'Stock cannot be negative']
    },
    medium: {
      type: Number,
      required: [true, 'Medium size stock is required'],
      min: [0, 'Stock cannot be negative']
    },
    large: {
      type: Number,
      required: [true, 'Large size stock is required'],
      min: [0, 'Stock cannot be negative']
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'summer-plant',
      'winter-plant',
      'indoor-plants',
      'outdoor-plants',
      'vegetable-plants',
      'fruits-plant',
      'trees',
      'ornamental',
      'shrubs',
      'herbs',
      'crops',
      'spices',
      'medicinal',
      'flower',
      'medicinal',
      'succulents',
    ]
  },
  plantImage: {
    type: String,
    required: [true, 'Plant image is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plant', plantSchema);
