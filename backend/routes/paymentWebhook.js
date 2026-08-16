const Stripe = require("stripe");
const Order = require("../models/Order");
const { fulfillPaidOrder } = require("../services/orderFulfillment");

async function paymentWebhook(req, res) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return res.status(503).json({ message: "Stripe webhook is not configured" });
  }

  const stripe = new Stripe(stripeSecret);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    const order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ stripeSessionId: session.id });

    if (order && session.payment_status === "paid") {
      await fulfillPaidOrder(order, {
        id: session.payment_intent || session.id,
        status: session.payment_status,
        email: session.customer_details?.email,
        method: "Stripe",
      });
    }
  }

  return res.json({ received: true });
}

module.exports = { paymentWebhook };
