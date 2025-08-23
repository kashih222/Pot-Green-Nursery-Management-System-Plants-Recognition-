const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: [true, 'plantId is required']
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: [true, 'size is required']
  },
  quantity: {
    type: Number,
    required: [true, 'quantity is required'],
    min: [1, 'quantity must be at least 1']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Waste', wasteSchema);


