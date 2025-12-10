const express = require('express');
const router = express.Router();
const cartController = require('../../Controllers/Web/cartController');
const authMiddleware = require('../../Middlewares/Admin/authMiddleware');
const { check, validationResult } = require('express-validator');
const authenticate = require('../../Middlewares/Admin/authMiddleware'); 

// Protect all cart routes
router.use(authMiddleware.protect);

// GET /api/cart - Get user's cart
router.get('/', cartController.getCart);

// POST /api/cart - Add item to cart
router.post('/', 
  [
    check('productId')
      .notEmpty().withMessage('Product ID is required')
      .isString().withMessage('Product ID must be a string')
      .trim(),
    check('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
      .trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg,
          location: err.location,
        }))
      });
    }
    next();
  },
  cartController.addToCart
);

// DELETE /api/cart/clear - Clear cart
router.delete('/clear', cartController.clearCart);

// PUT /api/cart/:itemId - Update cart item quantity
router.put('/:itemId',
  [
    check('itemId')
      .notEmpty().withMessage('Item ID is required')
      .isString().withMessage('Item ID must be a string')
      .trim(),
    check('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
      .trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg,
          location: err.location,
        }))
      });
    }
    next();
  },
  cartController.updateCartItem
);

// DELETE /api/cart/:itemId - Remove item from cart
router.delete('/:itemId',
  [
    check('itemId')
      .notEmpty().withMessage('Item ID is required')
      .isString().withMessage('Item ID must be a string')
      .trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          param: err.param,
          message: err.msg,
          location: err.location,
        }))
      });
    }
    next();
  },
  cartController.removeFromCart
);

module.exports = router;
