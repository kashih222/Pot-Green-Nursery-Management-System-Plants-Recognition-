const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  // Service Information
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Tree Planting',
      'Grass Cutting', 
      'Weeds Control',
      'Pots & Planters',
      'Garden Maintenance',
      'Landscaping',
      'Irrigation System',
      'Plant Care Consultation'
    ]
  },
  
  // Customer Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Service Details
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true,
    enum: [
      'Morning (8:00 AM - 12:00 PM)',
      'Afternoon (12:00 PM - 4:00 PM)',
      'Evening (4:00 PM - 8:00 PM)'
    ]
  },
  
  // Address Information
  streetAddress: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  
  // Additional Information
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Optional: Link to user if they're logged in
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'registerUser',
    required: false
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Estimated cost (can be filled by admin)
  estimatedCost: {
    type: Number,
    min: 0
  }
  
}, { 
  timestamps: true 
});

// Index for better query performance
serviceSchema.index({ email: 1, createdAt: -1 });
serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index({ serviceType: 1, status: 1 });

const ServiceModel = mongoose.model('Service', serviceSchema);
module.exports = ServiceModel;
