const Order = require('../../Models/Admin/Order');
const User = require('../../Models/Web/register.user');
const Product = require('../../Models/Admin/plantUpload');
const Notification = require('../../Models/Admin/Notification');
const mongoose = require('mongoose');
const { validateStatusChange } = require('../../Utils/orderStatus');
const { updateInventory } = require('../../Utils/orderStatus');
const { sendOrderEmail } = require('../../Services/emailService');

const createOrder = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { 
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      subtotal,
      shippingFee,
      discount,
      discountCode,
      codCharges,
      totalAmount,
      userDetails
    } = req.body;

    // Enhanced validation for required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one order item is required'
      });
    }

    // Validate all items have required fields and are valid MongoDB IDs
    const invalidItems = items.filter(item => {
      if (!item.product || !item.name || !item.price || !item.quantity) return true;
      if (!mongoose.Types.ObjectId.isValid(item.product)) return true;
      return false;
    });
    
    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are invalid or missing required fields',
        invalidItems
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Enhanced user details validation
    const requiredUserFields = ['firstName', 'lastName', 'email', 'phone'];
    const missingUserFields = requiredUserFields.filter(
      field => !userDetails || !userDetails[field]
    );

    if (missingUserFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Complete user details are required',
        missingFields: missingUserFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate payment method
    if (!['jazzcash', 'easypaisa', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Validate payment details if not COD
    if (paymentMethod !== 'cod' && (!paymentDetails || !paymentDetails.number)) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required for selected payment method'
      });
    }

    // Check product availability and update stock
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Verify all products exist
    const foundProductIds = products.map(p => p._id.toString());
    const missingProducts = productIds.filter(id => !foundProductIds.includes(id.toString()));
    
    if (missingProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products not found',
        missingProducts
      });
    }

    // Verify stock availability
    const insufficientStock = items.filter(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return !product.stockQuantity[item.size] || product.stockQuantity[item.size] < item.quantity;
    });

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items have insufficient stock',
        items: insufficientStock.map(item => {
          const product = products.find(p => p._id.toString() === item.product.toString());
          return {
            product: item.product,
            name: item.name,
            size: item.size,
            requestedQuantity: item.quantity,
            availableQuantity: product.stockQuantity[item.size] || 0
          };
        })
      });
    }

    // Create new order
    const order = new Order({
      user: req.user._id,
      userDetails: {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        phone: userDetails.phone
      },
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        size: item.size,
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      paymentDetails: paymentMethod === 'cod' ? {} : {
        number: paymentDetails.number,
        status: 'pending'
      },
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee || 200),
      discount: Number(discount || 0),
      discountCode,
      codCharges: Number(codCharges || 0),
      totalAmount: Number(totalAmount),
      status: 'pending'
    });

    // Save the order
    const createdOrder = await order.save();

    // Create notification for admin
    const notification = new Notification({
      title: 'New Order Received',
      message: `New order #${createdOrder._id} received from ${userDetails.firstName} ${userDetails.lastName}`,
      type: 'order',
      read: false
    });
    await notification.save();

    // Update product stock
    await Promise.all(items.map(async (item) => {
      const updateQuery = {};
      updateQuery[`stockQuantity.${item.size}`] = -item.quantity;
      
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: updateQuery },
        { new: true }
      );
    }));

    // Update user's order history
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: createdOrder._id } }
    );

    // Send order confirmation email
    try {
      await sendOrderEmail(userDetails.email, createdOrder, 'confirmation');
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    return res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const search = req.query.search;

    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    // Add search logic for order ID and user email
    if (search) {
      query.$or = [
        { _id: mongoose.Types.ObjectId.isValid(search) ? search : undefined },
        { 'userDetails.email': { $regex: search, $options: 'i' } },
        { 'userDetails.firstName': { $regex: search, $options: 'i' } },
        { 'userDetails.lastName': { $regex: search, $options: 'i' } }
      ].filter(Boolean);
    }

    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page,
      pages: Math.ceil(totalOrders / limit),
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const query = { user: req.user._id };
    if (status) query.status = status;

    console.log('Fetching orders for user:', req.user._id);

    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page,
      pages: Math.ceil(totalOrders / limit),
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID' 
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Authorization check
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order' 
    });
  }
};

const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentDetails = {
      ...order.paymentDetails,
      status: 'completed',
      transactionId: req.body.transactionId || null,
      method: order.paymentMethod,
      paidAmount: req.body.paidAmount || order.totalAmount
    };

    // Update inventory for paid orders
    await updateInventory(order, 'subtract');

    const updatedOrder = await order.save();

    // Send payment confirmation email
    await sendOrderEmail(order.userDetails.email, updatedOrder, 'payment');

    res.json({ 
      success: true, 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Update to paid error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (!validateStatusChange(order.status, 'delivered')) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot mark order as delivered from ${order.status} status`
      });
    }

    order.status = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    const updatedOrder = await order.save();

    // Send delivery notification
    await sendOrderEmail(order.userDetails.email, updatedOrder, 'delivered');

    res.json({ 
      success: true, 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Update to delivered error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update delivery status' 
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Authorization check
    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this order' 
      });
    }

    // Validate status transition
    if (!validateStatusChange(order.status, 'cancelled')) {
      return res.status(400).json({ 
        success: false,
        message: `Order in ${order.status} status cannot be cancelled`
      });
    }

    // Restore inventory if order was paid
    if (order.isPaid) {
      await updateInventory(order, 'add');
    }

    // Update order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = req.user.id;
    order.cancellationReason = req.body.reason || 'Customer request';
    
    const updatedOrder = await order.save();

    // Send cancellation email
    await sendOrderEmail(order.userDetails.email, updatedOrder, 'cancellation');

    res.json({ 
      success: true, 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, trackingCompany, trackingUrl, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Validate status transition
    if (!validateStatusChange(order.status, status)) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update order
    order.status = status;
    
    // Set timestamps and tracking for specific statuses
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.isDelivered = true;
    } else if (status === 'shipped') {
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (trackingCompany) order.trackingCompany = trackingCompany;
      if (trackingUrl) order.trackingUrl = trackingUrl;
    }

    if (notes) order.notes = notes;

    const updatedOrder = await order.save();

    // Send status update email
    if (['shipped', 'delivered', 'processing'].includes(status)) {
      await sendOrderEmail(order.userDetails.email, updatedOrder, status);
    }

    res.json({ 
      success: true, 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  updateOrderStatus
};