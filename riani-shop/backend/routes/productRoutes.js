const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

// Qof kasta wuu arki karaa products-ka
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin keliya ayaa samayn kara
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;