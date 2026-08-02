const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  markOrderAsPaid,
  markAsDelivered,
  deleteOrder,
} = require("../controllers/orderController");

const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");

// POST /api/orders
// Guest ama user: samee order cusub
router.post("/", optionalProtect, createOrder);

// GET /api/orders/myorders
// User: arag orders-kiisa
// Waa inuu ka horreeyaa /:id
router.get("/myorders", protect, getMyOrders);

// GET /api/orders
// Admin: arag dhammaan orders
router.get("/", protect, admin, getOrders);

// GET /api/orders/:id
// User-ka order-ka leh ama admin
router.get("/:id", protect, getOrderById);

// PUT /api/orders/:id/pay
// Order-ka calaamadee inuu paid yahay
router.put("/:id/pay", protect, markOrderAsPaid);

// PUT /api/orders/:id/status
// Admin: beddel status
router.put(
  "/:id/status",
  protect,
  admin,
  updateOrderStatus
);

// PUT /api/orders/:id/deliver
// Admin: calaamadee delivered
router.put(
  "/:id/deliver",
  protect,
  admin,
  markAsDelivered
);

// DELETE /api/orders/:id
// Admin: masax order
router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;