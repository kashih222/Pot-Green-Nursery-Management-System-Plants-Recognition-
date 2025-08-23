const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'registerUser',
    required: true
  },
  userDetails: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
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
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    }
  }],
  shippingAddress: {
    street: {
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
    country: {
      type: String,
      default: 'Pakistan'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod']
  },
  paymentDetails: {
    number: {
      type: String,
      select: false
    },
    transactionId: String,
    status: {
      type: String,
      default: 'pending'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 200,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  codCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add 7-day return window virtual field
OrderSchema.virtual('returnWindowExpires').get(function() {
  if (!this.deliveredAt) return null;
  const returnWindowDays = 7;
  return new Date(this.deliveredAt.getTime() + returnWindowDays * 24 * 60 * 60 * 1000);
});

// Indexes for better query performance
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'paymentDetails.transactionId': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Order', OrderSchema);