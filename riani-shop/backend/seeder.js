const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("./models/Product");
const products = require("./data/products");

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany();
    await Product.insertMany(products);

    console.log("Products imported successfully");
    process.exit();
  } catch (error) {
    console.error("Import error:", error.message);
    process.exit(1);
  }
};

importData();