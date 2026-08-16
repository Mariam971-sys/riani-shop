const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const { optionalProtect } = require("../middleware/authMiddleware");
const { checkoutLimiter } = require("../middleware/rateLimit");
const { buildOrderFromPayload } = require("../services/checkoutService");
const { fulfillPaidOrder } = require("../services/orderFulfillment");
const { CURRENCY, COMPANY, toMinorUnits } = require("../config/shop");

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function frontendBaseUrl() {
  const fromEnv = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((value) => value.trim())
    .find((value) => value.startsWith("http"));

  return fromEnv || "https://riani-shop.com";
}

router.post(
  "/create-checkout-session",
  checkoutLimiter,
  optionalProtect,
  async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({
          message:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.",
        });
      }

      const built = await buildOrderFromPayload({
        orderItems: req.body.orderItems || req.body.items,
        shippingAddress: req.body.shippingAddress,
        promoCode: req.body.promoCode,
      });

      const order = await Order.create({
        user: req.user?._id || null,
        ...built,
        paymentMethod: "Stripe",
        isPaid: false,
        status: "Pending",
      });

      const sessionParams = {
        mode: "payment",
        customer_email: built.shippingAddress.email,
        locale: "sv",
        payment_method_types: ["card", "swish"],
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: `Riani Shop order`,
                description: built.orderItems
                  .map((item) => `${item.name} x${item.quantity}`)
                  .join(", ")
                  .slice(0, 500),
              },
              unit_amount: toMinorUnits(built.totalPrice),
            },
            quantity: 1,
          },
        ],
        success_url: `${frontendBaseUrl()}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBaseUrl()}/checkout`,
        metadata: {
          orderId: String(order._id),
          shop: COMPANY.name,
        },
        client_reference_id: String(order._id),
      };

      let session;
      try {
        session = await stripe.checkout.sessions.create(sessionParams);
      } catch (stripeError) {
        const swishUnavailable = /payment method type provided: swish/i.test(
          stripeError.message || ""
        );
        if (!swishUnavailable) {
          throw stripeError;
        }
        console.warn(
          "Swish is not enabled on this Stripe account; creating card-only checkout."
        );
        session = await stripe.checkout.sessions.create({
          ...sessionParams,
          payment_method_types: ["card"],
        });
      }

      order.stripeSessionId = session.id;
      await order.save();

      return res.status(200).json({
        id: session.id,
        url: session.url,
        orderId: order._id,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      return res.status(error.statusCode || 500).json({
        message: error.message || "Unable to create checkout session",
      });
    }
  }
);

router.get("/session/:id", optionalProtect, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    const orderId = session.metadata?.orderId || session.client_reference_id;
    let order = orderId ? await Order.findById(orderId) : null;

    if (!order && session.id) {
      order = await Order.findOne({ stripeSessionId: session.id });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (session.payment_status === "paid" && !order.isPaid) {
      order = await fulfillPaidOrder(order, {
        id: session.payment_intent || session.id,
        status: session.payment_status,
        email: session.customer_details?.email,
        method: "Stripe",
      });
    }

    return res.json({
      order,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res.status(500).json({
      message: "Could not load payment session",
    });
  }
});

module.exports = router;
