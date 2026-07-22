const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  markAsDelivered,
} = require("../controllers/orderController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post("/", protect, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get logged-in user's orders
// @access  Private
router.get("/myorders", protect, getMyOrders);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Admin
router.get("/", protect, admin, getOrders);

// @route   GET /api/orders/:id
// @desc    Get one order by ID
// @access  Private
router.get("/:id", protect, getOrderById);

// @route   PUT /api/orders/:id/deliver
// @desc    Mark order as delivered
// @access  Admin
router.put(
  "/:id/deliver",
  protect,
  admin,
  markAsDelivered
);

module.exports = router;