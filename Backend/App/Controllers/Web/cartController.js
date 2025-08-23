const Cart = require('../../Models/Web/Cart');
const Plant = require('../../Models/Admin/plantUpload');
const mongoose = require('mongoose');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'plantName prices plantImage');
    
    if (!cart) {
      return res.status(200).json({ items: [], totalPrice: 0, totalItems: 0 });
    }
    
    const items = cart.items.map(item => ({
      ...item.toObject(),
      plantName: item.productId?.plantName || item.name,
      image: item.productId?.plantImage || item.image
    }));

    res.status(200).json({
      items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems
    });
  } catch (error) {
    console.error('GetCart Error:', error);
    res.status(500).json({ 
      message: 'Error fetching cart', 
      error: error.message 
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    
    if (!productId || !size) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID and size are required' 
      });
    }

    // Validate size
    if (!['small', 'medium', 'large'].includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid size. Must be small, medium, or large'
      });
    }

    // Find the plant and check stock
    const plant = await Plant.findById(productId);
    if (!plant) {
      return res.status(404).json({ 
        success: false,
        message: 'Plant not found' 
      });
    }

    // Check if enough stock is available
    if (plant.stockQuantity[size] < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock available for ${size} size`
      });
    }

    // Get the price for the selected size
    const price = plant.prices[size];

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        userId: req.user._id,
        items: [{
          productId,
          name: plant.plantName,
          size,
          price,
          quantity,
          image: plant.plantImage
        }],
        totalPrice: price * quantity,
        totalItems: quantity
      });
    } else {
      // Check if item with same product ID and size exists
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (plant.stockQuantity[size] < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock available for ${size} size`
          });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          name: plant.plantName,
          size,
          price,
          quantity,
          image: plant.plantImage
        });
      }

      // Update cart totals
      cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding item to cart', 
      error: error.message 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity, size } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // If size is being changed, validate and update price
    if (size && size !== cart.items[itemIndex].size) {
      const plant = await Plant.findById(cart.items[itemIndex].productId);
      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }

      if (plant.stockQuantity[size] < quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock available for ${size} size`
        });
      }

      cart.items[itemIndex].size = size;
      cart.items[itemIndex].price = plant.prices[size];
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    console.error('UpdateCartItem Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemExists = cart.items.some(item => item._id.toString() === itemId);
    if (!itemExists) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    // Recalculate totals after removing item
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    await cart.save();

    res.status(200).json({
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error('RemoveFromCart Error:', error);
    res.status(500).json({ 
      message: 'Error removing item', 
      error: error.message 
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(200).json({ message: 'Cart is already empty' });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ 
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    });
  } catch (error) {
    console.error('ClearCart Error:', error);
    res.status(500).json({ 
      message: 'Error clearing cart', 
      error: error.message 
    });
  }
};

// Helper function for consistent image URLs
function formatImageUrl(imagePath) {
  if (!imagePath) return '';
  return imagePath.startsWith('/uploads') 
    ? `http://localhost:8020${imagePath}`
    : `http://localhost:8020/uploads/${imagePath}`;
}
