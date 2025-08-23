const ServiceModel = require('../../Models/Web/Service');
const { sendServiceRequestEmail } = require('../../Services/emailService');

// 📝 Create a new service request
const createServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      fullName,
      email,
      phoneNumber,
      preferredDate,
      preferredTime,
      streetAddress,
      city,
      zipCode,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (!serviceType || !fullName || !email || !phoneNumber || !preferredDate || !preferredTime || !streetAddress || !city || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate date (should not be in the past)
    const selectedDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date cannot be in the past'
      });
    }

    // Create new service request
    const newService = new ServiceModel({
      serviceType,
      fullName,
      email,
      phoneNumber,
      preferredDate: selectedDate,
      preferredTime,
      streetAddress,
      city,
      zipCode,
      additionalNotes,
      userId: req.user?._id || null // Link to user if logged in
    });

    const savedService = await newService.save();

    // Send confirmation email (if email service is configured)
    try {
      await sendServiceRequestEmail(email, fullName, serviceType, selectedDate, preferredTime);
    } catch (emailError) {
      console.log('Email service not configured or failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully!',
      data: {
        id: savedService._id,
        serviceType: savedService.serviceType,
        status: savedService.status,
        estimatedResponseTime: '24-48 hours'
      }
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Check if it's a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit service request',
      error: error.message
    });
  }
};

// 📋 Get all service requests (for admin panel)
const getAllServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, serviceType, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const services = await ServiceModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email');

    const total = await ServiceModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: error.message
    });
  }
};

// 🔍 Get service request by ID
const getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await ServiceModel.findById(id).populate('userId', 'fullName email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request',
      error: error.message
    });
  }
};

// ✏️ Update service request status (admin only)
const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedCost } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;

    const updatedService = await ServiceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email');

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service request updated successfully',
      data: updatedService
    });

  } catch (error) {
    console.error('Error updating service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: error.message
    });
  }
};

// 🗑️ Delete service request (admin only)
const deleteServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedService = await ServiceModel.findByIdAndDelete(id);
    
    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service request',
      error: error.message
    });
  }
};

// 📊 Get service statistics (for admin dashboard)
const getServiceStatistics = async (req, res) => {
  try {
    const totalServices = await ServiceModel.countDocuments();
    const pendingServices = await ServiceModel.countDocuments({ status: 'pending' });
    const completedServices = await ServiceModel.countDocuments({ status: 'completed' });
    
    // Service type distribution
    const serviceTypeStats = await ServiceModel.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await ServiceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalServices,
        pendingServices,
        completedServices,
        serviceTypeStats,
        monthlyTrend
      }
    });

  } catch (error) {
    console.error('Error fetching service statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: error.message
    });
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceStatus,
  deleteServiceRequest,
  getServiceStatistics
};
