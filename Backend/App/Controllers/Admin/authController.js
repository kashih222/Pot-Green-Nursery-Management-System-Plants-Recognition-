const User = require('../../Models/Web/register.user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

// Login Controller
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token (24h expiry)
    const token = jwt.sign(
      {
        id: user._id.toString(),  // Ensure id is string
        name: user.fullName || user.email.split('@')[0], // Fallback to email prefix if name not available
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Send response with token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),  // Ensure consistent id format
        name: user.fullName || user.email.split('@')[0], // Fallback to email prefix
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || null,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};