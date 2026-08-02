const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { corsOptions } = require("./config/cors");
const { getDbStatus } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimit");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors(corsOptions()));
app.options("*", cors(corsOptions()));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

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
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
