const Order = require("../models/Order");
const { createPrintfulOrder } = require("../utils/printful");
const { sendOrderEmails } = require("../utils/mailer");

async function fulfillPaidOrder(order, paymentResult = {}) {
  if (!order) {
    return null;
  }

  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "Processing";
    order.paymentMethod = paymentResult.method || order.paymentMethod || "Stripe";
    if (paymentResult.id) {
      order.paymentResult = {
        id: paymentResult.id,
        status: paymentResult.status || "paid",
        updateTime: new Date().toISOString(),
        emailAddress: paymentResult.email || order.shippingAddress?.email || "",
      };
    }
  }

  const hasPrintfulItems = (order.orderItems || []).some(
    (item) => item.source === "printful"
  );

  if (hasPrintfulItems && !order.printfulOrderId) {
    try {
      const printfulOrder = await createPrintfulOrder(order);
      if (printfulOrder?.id) {
        order.printfulOrderId = String(printfulOrder.id);
      }
    } catch (error) {
      console.error("Printful order error:", error.message);
    }
  }

  if (!order.emailsSent) {
    try {
      await sendOrderEmails(order);
      order.emailsSent = true;
    } catch (error) {
      console.error("Order email error:", error.message);
    }
  }

  return order.save();
}

async function fulfillById(orderId, paymentResult) {
  const order = await Order.findById(orderId);
  if (!order) {
    return null;
  }
  return fulfillPaidOrder(order, paymentResult);
}

module.exports = {
  fulfillPaidOrder,
  fulfillById,
};
