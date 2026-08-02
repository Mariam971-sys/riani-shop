const mongoose = require("mongoose");
const Product = require("../models/Product");

// GET /api/products
// Get all products with optional search, category, sorting, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category.trim()) {
      query.category = category.trim();
    }

    let sortOptions = {
      createdAt: -1,
    };

    if (sort === "price-low") {
      sortOptions = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOptions = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOptions = {
        rating: -1,
      };
    }

    if (sort === "oldest") {
      sortOptions = {
        createdAt: 1,
      };
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 12, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      products,
      page: pageNumber,
      pages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Could not fetch products.",
    });
  }
};

// GET /api/products/:id
// Get a single product
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Could not fetch the product.",
    });
  }
};

// POST /api/products
// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      brand,
      images,
      image,
      sizes,
      colors,
      material,
      countInStock,
      isFeatured,
      isOnSale,
      salePrice,
    } = req.body;

    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : image
        ? [image]
        : [];

    const product = await Product.create({
      name,
      price: Number(price),
      description,
      category,
      brand: brand || "Riani",
      images: normalizedImages,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      material: material || "",
      countInStock: Number(countInStock),
      isFeatured: Boolean(isFeatured),
      isOnSale: Boolean(isOnSale),
      salePrice:
        salePrice === "" ||
        salePrice === null ||
        salePrice === undefined
          ? null
          : Number(salePrice),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    res.status(400).json({
      message: error.message || "Could not create product.",
    });
  }
};

// PUT /api/products/:id
// Update an existing product
const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const {
      name,
      price,
      description,
      category,
      brand,
      images,
      image,
      sizes,
      colors,
      material,
      countInStock,
      isFeatured,
      isOnSale,
      salePrice,
    } = req.body;

    if (name !== undefined) {
      product.name = name;
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (brand !== undefined) {
      product.brand = brand;
    }

    if (Array.isArray(images)) {
      product.images = images.filter(Boolean);
    } else if (image) {
      product.images = [image];
    }

    if (Array.isArray(sizes)) {
      product.sizes = sizes;
    }

    if (Array.isArray(colors)) {
      product.colors = colors;
    }

    if (material !== undefined) {
      product.material = material;
    }

    if (countInStock !== undefined) {
      product.countInStock = Number(countInStock);
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isOnSale !== undefined) {
      product.isOnSale = Boolean(isOnSale);
    }

    if (salePrice !== undefined) {
      product.salePrice =
        salePrice === "" || salePrice === null
          ? null
          : Number(salePrice);
    }

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);

    res.status(400).json({
      message: error.message || "Could not update product.",
    });
  }
};

// DELETE /api/products/:id
// Delete a product
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Could not delete product.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};