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
      min: 1,
      max: 5,
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
        validator(images) {
          return Array.isArray(images) && images.length > 0;
        },
        message: "At least one product image is required",
      },
    },

    sizes: {
      type: [
        {
          type: String,
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
      ],
      default: [],
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
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
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
        validator(value) {
          if (!this.isOnSale) {
            return true;
          }

          return (
            value !== null &&
            value !== undefined &&
            value < this.price
          );
        },
        message:
          "Sale price must be lower than the regular price",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);