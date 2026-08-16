const mongoose = require("mongoose");

// Product kasta oo order-ka ku jira
const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    product: {
      type: String,
      required: [true, "Product ID is required"],
      trim: true,
    },

    source: {
      type: String,
      enum: ["normal", "printful"],
      default: "normal",
    },

    printfulId: {
      type: String,
      default: "",
      trim: true,
    },

    printfulVariantId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// Cinwaanka loo dirayo order-ka
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// Xogta lacag-bixinta
const paymentResultSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      default: "",
      trim: true,
    },

    updateTime: {
      type: String,
      default: "",
      trim: true,
    },

    emailAddress: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  {
    _id: false,
  }
);

// Order-ka oo dhan
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must contain at least one product",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: [
        "Cash on Delivery",
        "Card",
        "Stripe",
        "Klarna",
        "PayPal",
      ],
      default: "Cash on Delivery",
    },

    paymentResult: {
      type: paymentResultSchema,
      default: undefined,
    },

    itemsPrice: {
      type: Number,
      required: true,
      min: [0, "Items price cannot be negative"],
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      min: [0, "Shipping price cannot be negative"],
      default: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      min: [0, "Tax price cannot be negative"],
      default: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: [0, "Discount cannot be negative"],
      default: 0,
    },

    currency: {
      type: String,
      default: "SEK",
      trim: true,
    },

    stripeSessionId: {
      type: String,
      default: "",
      trim: true,
    },

    printfulOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    emailsSent: {
      type: Boolean,
      default: false,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);