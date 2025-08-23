const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: [true, 'Product ID is required'],
    index: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid ObjectId`
    }
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  size: {
    type: String,
    required: [true, 'Plant size is required'],
    enum: ['small', 'medium', 'large']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 1,
    min: [1, 'Minimum quantity is 1'],
    max: [100, 'Maximum quantity is 100'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  image: {
    type: String,
    required: [true, 'Image path is required'],
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|webp)$/i.test(v) || 
               v.startsWith('http') || 
               v.startsWith('/uploads');
      },
      message: props => `${props.value} is not a valid image path`
    }
  }
}, { 
  _id: true,
  timestamps: false // Disable individual item timestamps
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Total price cannot be negative']
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Total items cannot be negative']
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure totals are always calculated correctly
cartSchema.pre('save', function(next) {
  if (this.items && Array.isArray(this.items)) {
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  } else {
    this.totalPrice = 0;
    this.totalItems = 0;
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);