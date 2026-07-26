const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      orders,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.find().select("totalPrice"),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum + Number(order.totalPrice || 0),
      0
    );

    res.status(200).json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Could not load dashboard statistics.",
    });
  }
};

module.exports = {
  getDashboardStats,
};