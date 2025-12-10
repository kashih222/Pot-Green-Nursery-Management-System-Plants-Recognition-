const Product = require('../../Models/Admin/Order');

const updateInventory = async (order, action) => { // action: 'add' or 'subtract'
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: action === 'subtract' ? -item.quantity : item.quantity } }
      );
    }
  } catch (error) {
    console.error('Inventory update failed:', error);
    throw error;
  }
};

module.exports = { updateInventory };
