const express = require("express");
const { printfulRequest } = require("../utils/printful");

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    if (!process.env.PRINTFUL_API_TOKEN) {
      return res.status(200).json({ result: [] });
    }

    const data = await printfulRequest("/sync/products");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Printful error:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Unable to connect to Printful",
    });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    if (!process.env.PRINTFUL_API_TOKEN) {
      return res.status(404).json({
        message: "Printful product not found",
      });
    }

    const data = await printfulRequest(`/sync/products/${req.params.id}`);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Printful error:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Unable to connect to Printful",
    });
  }
});

module.exports = router;
