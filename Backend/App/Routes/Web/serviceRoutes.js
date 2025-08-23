const express = require("express");
const router = express.Router();
const { 
  createServiceRequest, 
  getAllServiceRequests, 
  getServiceRequestById, 
  updateServiceStatus, 
  deleteServiceRequest, 
  getServiceStatistics 
} = require("../../Controllers/Web/serviceController");
const { protect } = require("../../Middelwares/Admin/authMiddleware");

// Public routes (no authentication required)
// Note: create route now requires authentication
router.post("/create", protect, createServiceRequest);

// Protected routes (require authentication)
router.get("/all", getAllServiceRequests);
router.get("/:id", getServiceRequestById);
router.put("/:id/status", updateServiceStatus);
router.delete("/:id", deleteServiceRequest);
router.get("/statistics/overview", getServiceStatistics);

module.exports = router;
