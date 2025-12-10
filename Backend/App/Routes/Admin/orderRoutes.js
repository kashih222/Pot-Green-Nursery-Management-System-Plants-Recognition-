const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  updateOrderStatus
} = require('../../Controllers/Admin/orderController');
const { getOrderStats } = require('../../Controllers/Admin/orderAnalytics');
const { protect, adminOnly, orderAccess } = require('../../Middlewares/Admin/authMiddleware');

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', protect, orderAccess, createOrder);

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged in user orders
 * @access  Private
 */
router.get('/myorders', protect, orderAccess, getMyOrders);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order analytics and statistics
 * @access  Private/Admin
 */
router.get('/stats', protect, adminOnly, getOrderStats);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, adminOnly, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, orderAccess, getOrderById);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    Update order to paid
 * @access  Private
 */
router.put('/:id/pay', protect, adminOnly, updateOrderToPaid);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Update order to delivered (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/deliver', protect, adminOnly, updateOrderToDelivered);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', protect, orderAccess, cancelOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;