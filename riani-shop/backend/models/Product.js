const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "Women",
        "Men",
        "Kids",
        "Shoes",
        "Accessories",
      ],
    },

    brand: {
      type: String,
      default: "Riani",
      trim: true,
    },

    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: function (images) {
          return Array.isArray(images) && images.length > 0;
        },
        message: "At least one product image is required",
      },
    },

    sizes: {
      type: [String],
      default: [],
      enum: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "One Size",
      ],
    },

    colors: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    countInStock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
    },

    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isOnSale: {
      type: Boolean,
      default: false,
    },

    salePrice: {
      type: Number,
      default: null,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (value) {
          if (!this.isOnSale) {
            return true;
          }

          return (
            value !== null &&
            value !== undefined &&
            value >= 0 &&
            value < this.price
          );
        },
        message:
          "Sale price is required and must be lower than the regular price",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);