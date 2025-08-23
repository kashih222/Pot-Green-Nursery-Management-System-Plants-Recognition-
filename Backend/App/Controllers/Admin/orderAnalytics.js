const Order = require('../../Models/Admin/Order');
const User = require('../../Models/Web/register.user');
const Product = require('../../Models/Admin/plantUpload');

const getOrderStats = async (req, res) => {
  try {
    console.log('Starting analytics request...');
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);

    // Get total products count
    const totalProducts = await Product.countDocuments();
    console.log('Total products:', totalProducts);

    let stats = [];
    try {
      console.log('Executing aggregation pipeline...');
      stats = await Order.aggregate([
        // First stage: ensure we have valid documents
        {
          $match: {
            _id: { $exists: true, $ne: null },
            totalAmount: { $exists: true, $ne: null },
            status: { $exists: true, $ne: null }
          }
        },
        // Second stage: facet for different analytics
        {
          $facet: {
            statusCounts: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            monthlySales: [
              {
                $match: {
                  status: 'delivered',
                  totalAmount: { $exists: true, $ne: null },
                  createdAt: { $exists: true, $ne: null }
                }
              },
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                  },
                  total: { $sum: { $ifNull: ["$totalAmount", 0] } },
                  count: { $sum: 1 }
                }
              },
              { 
                $sort: { 
                  "_id.year": 1,
                  "_id.month": 1,
                  "_id.day": 1 
                } 
              }
            ],
            recentOrders: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                  }
                }
              },
              { $sort: { createdAt: -1 } },
              {
                $project: {
                  _id: 1,
                  status: 1,
                  totalAmount: 1,
                  createdAt: 1,
                  userDetails: 1,
                  items: 1
                }
              }
            ],
            // Add time-based orders
            timeBasedOrders: [
              {
                $match: {
                  createdAt: { $exists: true, $ne: null }
                }
              },
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                  },
                  orders: {
                    $push: {
                      _id: "$_id",
                      status: "$status",
                      totalAmount: "$totalAmount",
                      createdAt: "$createdAt",
                      userDetails: "$userDetails",
                      items: "$items"
                    }
                  },
                  totalAmount: { $sum: "$totalAmount" },
                  count: { $sum: 1 }
                }
              },
              { 
                $sort: { 
                  "_id.year": -1,
                  "_id.month": -1,
                  "_id.day": -1 
                } 
              }
            ]
          }
        }
      ]);
      console.log('Aggregation completed successfully');
    } catch (aggError) {
      console.error('Aggregation error details:', {
        message: aggError.message,
        stack: aggError.stack,
        name: aggError.name
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to process analytics data',
        error: aggError.message
      });
    }

    // Defensive: ensure stats[0] exists and has the right structure
    const result = stats[0] || {};
    console.log('Aggregation result structure:', {
      hasStatusCounts: !!result.statusCounts,
      hasMonthlySales: !!result.monthlySales,
      hasRecentOrders: !!result.recentOrders,
      hasTimeBasedOrders: !!result.timeBasedOrders
    });

    // Ensure all arrays exist and are valid
    const statusCounts = Array.isArray(result.statusCounts) ? result.statusCounts : [];
    const monthlySales = Array.isArray(result.monthlySales) ? result.monthlySales : [];
    const recentOrders = Array.isArray(result.recentOrders) ? result.recentOrders : [];
    const timeBasedOrders = Array.isArray(result.timeBasedOrders) ? result.timeBasedOrders : [];

    // Validate and clean the data
    const cleanedMonthlySales = monthlySales.map(sale => ({
      _id: sale._id || 0,
      total: Number(sale.total) || 0,
      count: Number(sale.count) || 0
    }));

    const cleanedStatusCounts = statusCounts.map(status => ({
      _id: status._id || 'unknown',
      count: Number(status.count) || 0
    }));

    const cleanedRecentOrders = recentOrders.map(order => ({
      _id: order._id,
      status: order.status || 'unknown',
      totalAmount: Number(order.totalAmount) || 0,
      createdAt: order.createdAt,
      userDetails: order.userDetails || {},
      items: order.items || []
    }));

    const cleanedTimeBasedOrders = timeBasedOrders.map(day => {
      try {
        const date = new Date(day._id.year, day._id.month - 1, day._id.day);
        console.log('Processing day:', {
          year: day._id.year,
          month: day._id.month,
          day: day._id.day,
          date: date
        });
        
        return {
          date: date,
          orders: day.orders.map(order => ({
            _id: order._id,
            status: order.status || 'unknown',
            totalAmount: Number(order.totalAmount) || 0,
            createdAt: order.createdAt,
            userDetails: order.userDetails || {},
            items: order.items || []
          })),
          totalAmount: Number(day.totalAmount) || 0,
          count: Number(day.count) || 0
        };
      } catch (error) {
        console.error('Error processing day:', error);
        return null;
      }
    }).filter(Boolean);

    console.log('Cleaned TimeBasedOrders:', cleanedTimeBasedOrders);

    const response = {
      success: true,
      stats: {
        statusCounts: cleanedStatusCounts,
        monthlySales: cleanedMonthlySales,
        recentOrders: cleanedRecentOrders,
        timeBasedOrders: cleanedTimeBasedOrders,
        totalUsers,
        totalProducts
      }
    };

    console.log('Sending response:', {
      success: response.success,
      statsCount: {
        statusCounts: cleanedStatusCounts.length,
        monthlySales: cleanedMonthlySales.length,
        recentOrders: cleanedRecentOrders.length,
        timeBasedOrders: cleanedTimeBasedOrders.length
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Analytics error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

module.exports = { getOrderStats };