const express = require("express");

const router = express.Router();

// Controllers
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
} = require("../controllers/userController");

// Middleware
const { protect, admin } = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getUserProfile);

// Admin - Get all users
router.get("/", protect, admin, getUsers);

module.exports = router;