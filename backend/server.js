const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: ".env.local" });

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    if (!process.env.PRINTFUL_API_TOKEN) {
      console.warn("PRINTFUL_API_TOKEN is missing");
    }

    console.log(
      "Printful token loaded:",
      process.env.PRINTFUL_API_TOKEN ? "YES" : "NO"
    );

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();