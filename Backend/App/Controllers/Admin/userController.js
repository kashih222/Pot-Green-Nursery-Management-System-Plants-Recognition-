const User = require("../../Models/Web/register.user"); // Adjust the path as necessary
const fs = require('fs');
const path = require('path');
const { uploadFile, deleteFile } = require('../../Services/appwriteService');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v"); // ✨ Exclude password and __v
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message }); // ✨ Include error details
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser }); // ✨ Added 200 status for consistency
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// Get total user count
const totalUser = async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: "Failed to count users", error: error.message }); // ✨ Consistent error structure
  }
};

// Fetch single user data
const fetchUserData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v'); // ✨ Exclude __v also
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user); // ✨ 200 status for success
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    // Get user ID from the decoded token in req.user
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User ID not found in token' 
      });
    }

    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: user, admin, moderator'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { fullName, email, password } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) {
      // Password will be hashed automatically by the pre-save middleware
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine bucket ID: prefer APPWRITE_USER_BUCKET_ID, fallback to default
    const userBucketId = process.env.APPWRITE_USER_BUCKET_ID || process.env.APPWRITE_BUCKET_ID;

    // Upload new image to Appwrite
    let profilePicUrl = null;
    try {
      profilePicUrl = await uploadFile(req.file.path, req.file.originalname, userBucketId);
    } catch (uploadError) {
       console.error('Appwrite upload failed:', uploadError);
       return res.status(500).json({
         success: false,
         message: 'Failed to upload image to storage',
         error: uploadError.message
       });
    }

    // Delete old profile image if it exists
    if (user.profilePic) {
      if (user.profilePic.startsWith('http')) {
         // It's an Appwrite URL, delete from Appwrite
         try {
           await deleteFile(user.profilePic);
         } catch (err) {
           console.error('Failed to delete old image from Appwrite:', err);
         }
      } else {
         // It's a local file
         const oldImagePath = path.join(__dirname, '../../../uploads', user.profilePic);
         if (fs.existsSync(oldImagePath)) {
           fs.unlinkSync(oldImagePath);
         }
      }
    }

    // Update user with new profile image URL
    user.profilePic = profilePicUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      user: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
};

module.exports = { 
  getAllUsers, 
  deleteUser, 
  totalUser, 
  fetchUserData, 
  getCurrentUser,
  updateUserRole,
  updateUserProfile,
  uploadProfileImage
};