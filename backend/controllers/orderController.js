const mongoose = require("mongoose");
const Order = require("../models/Order");
const { buildOrderFromPayload } = require("../services/checkoutService");

// Create New Order
const createOrder = async (req, res) => {
  try {
    const built = await buildOrderFromPayload({
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      promoCode: req.body.promoCode,
    });

    const order = await Order.create({
      user: req.user?._id || null,
      ...built,
      paymentMethod: req.body.paymentMethod || "Stripe",
    });

    const createdOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Order could not be created",
    });
  }
};

// Get Logged-in User Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate("user", "name email");

    res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      message: error.message || "Could not load your orders",
    });
  }
};

// Get Single Order By ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id).populate(
      "user",
      "name email isAdmin"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const orderUserId =
      order.user?._id?.toString() || order.user?.toString() || "";

    const loggedInUserId = req.user?._id?.toString() || "";
    const orderEmail = String(
      order.shippingAddress?.email || ""
    ).trim().toLowerCase();
    const requestedEmail = String(req.query.email || "")
      .trim()
      .toLowerCase();

    if (req.user?.isAdmin) {
      return res.json(order);
    }

    if (loggedInUserId && orderUserId && orderUserId === loggedInUserId) {
      return res.json(order);
    }

    if (requestedEmail && orderEmail && requestedEmail === orderEmail) {
      return res.json(order);
    }

    return res.status(403).json({
      message: "You are not authorized to view this order",
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    res.status(500).json({
      message: error.message || "Could not load order details",
    });
  }
};

// Get All Orders - Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1,
      })
      .populate("user", "name email");

    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: error.message || "Orders could not be loaded",
    });
  }
};

// Update Order Status - Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: error.message || "Order status could not be updated",
    });
  }
};

// Mark Order as Paid
const markOrderAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    if (req.body.paymentResult) {
      order.paymentResult = req.body.paymentResult;
    }

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Mark order as paid error:", error);

    res.status(500).json({
      message: error.message || "Order payment could not be updated",
    });
  }
};

// Mark Order as Delivered - Admin
const markAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = "Delivered";
    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Mark delivered error:", error);

    res.status(500).json({
      message: error.message || "Order could not be updated",
    });
  }
};

// Delete Order - Admin
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(500).json({
      message: error.message || "Order could not be deleted",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  markOrderAsPaid,
  markAsDelivered,
  deleteOrder,
};