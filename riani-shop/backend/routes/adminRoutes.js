const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/adminController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

// Admin dashboard statistics
router.get(
  "/dashboard",
  protect,
  admin,
  getDashboardStats
);

module.exports = router;