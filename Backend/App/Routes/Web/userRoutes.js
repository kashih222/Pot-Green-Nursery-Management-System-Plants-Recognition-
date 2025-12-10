const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, totalUser, fetchUserData, getCurrentUser, updateUserRole, updateUserProfile, uploadProfileImage } = require("../../Controllers/Admin/userController");
const { protect } = require("../../Middlewares/Admin/authMiddleware");
const upload = require("../../Middlewares/Admin/upload");

// User profile routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUserProfile);
router.post('/me/profile-image', protect, upload.single('profileImage'), uploadProfileImage);

// Other routes
router.get("/userslist", getAllUsers);
router.delete("/userdelete/:id", deleteUser);
router.get('/total', totalUser);
router.get('/users/:id', fetchUserData);
router.put('/users/:id/role', protect, updateUserRole);

module.exports = router;