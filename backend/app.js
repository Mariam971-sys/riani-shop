const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { corsOptions } = require("./config/cors");
const { connectDB, getDbStatus } = require("./config/db");
const {
  COMPANY,
  CURRENCY,
  VAT_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} = require("./config/shop");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const {
  apiLimiter,
  authLimiter,
} = require("./middleware/rateLimit");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { paymentWebhook } = require("./routes/paymentWebhook");
const printfulRoutes = require("./routes/printfulRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(cors(corsOptions()));
app.options("*", cors(corsOptions()));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      message: "Database unavailable",
    });
  }
});

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook
);

app.use(express.json({ limit: "2mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Riani Shop API is running",
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = getDbStatus();
  const healthy = dbStatus === "connected";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    server: "running",
    database: dbStatus,
    stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "missing",
    printful: process.env.PRINTFUL_API_TOKEN ? "configured" : "missing",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/shop/settings", (req, res) => {
  res.json({
    currency: CURRENCY.toUpperCase(),
    vatRate: VAT_RATE,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    standardShipping: STANDARD_SHIPPING,
    company: {
      name: COMPANY.name,
      orgNr: COMPANY.orgNr,
      address: COMPANY.address,
      email: COMPANY.email,
      country: COMPANY.country,
    },
  });
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/printful", printfulRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
