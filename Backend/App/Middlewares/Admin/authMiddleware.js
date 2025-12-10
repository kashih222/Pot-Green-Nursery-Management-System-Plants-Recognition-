const jwt = require('jsonwebtoken');
const User = require('../../Models/Web/register.user');

exports.protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please login.',
        error: 'AUTH_REQUIRED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or deleted',
        error: 'USER_NOT_FOUND'
      });
    }

    // Set user info in request
    req.user = {
      _id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('Auth Error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        error: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'FORBIDDEN'
    });
  }
  next();
};

// Middleware for order access
exports.orderAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'AUTH_REQUIRED'
    });
  }
  next();
};