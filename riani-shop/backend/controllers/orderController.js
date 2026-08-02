const mongoose = require("mongoose");
const Order = require("../models/Order");

// Create New Order
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    const invalidOrderItem = orderItems.some(
      (item) =>
        !item.product ||
        !item.name ||
        Number(item.price) < 0 ||
        Number(item.quantity) < 1
    );

    if (invalidOrderItem) {
      return res.status(400).json({
        message: "One or more order items are invalid",
      });
    }

    const normalizedOrderItems = orderItems.map((item) => ({
      product: item.product,
      name: item.name,
      image: item.image || "",
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
      size: item.size || item.selectedSize || "",
      color: item.color || item.selectedColor || "",
    }));

    const order = await Order.create({
      user: req.user?._id || null,

      orderItems: normalizedOrderItems,

      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone || "",
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },

      paymentMethod: paymentMethod || "Cash on Delivery",

      itemsPrice: Number(itemsPrice || 0),
      shippingPrice: Number(shippingPrice || 0),
      taxPrice: Number(taxPrice || 0),
      totalPrice: Number(totalPrice || 0),
    });

    const createdOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
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
      order.user?._id?.toString() || order.user?.toString();

    const loggedInUserId = req.user._id.toString();

    if (!req.user.isAdmin && orderUserId !== loggedInUserId) {
      return res.status(403).json({
        message: "You are not authorized to view this order",
      });
    }

    res.json(order);
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