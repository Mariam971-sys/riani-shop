function notFound(req, res, next) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, req, res, next) {
  console.error("Server error:", error.message);

  if (error.message && error.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      message: "Origin not allowed by CORS",
    });
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode >= 400 ? statusCode : 500).json({
    message: isProduction
      ? error.publicMessage || "Internal server error"
      : error.message || "Internal server error",
  });
}

module.exports = { notFound, errorHandler };
