const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const normalizeEmail = (email = "") => {
  return email.trim().toLowerCase();
};

// POST /api/users/register
// Register user
const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register user error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    return res.status(500).json({
      message: error.message || "User could not be registered",
    });
  }
};

// POST /api/users/login
// Login user
const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login user error:", error);

    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// GET /api/users/profile
// Get logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      message: error.message || "Could not load profile",
    });
  }
};

// PUT /api/users/profile
// Update logged-in user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.body.name !== undefined) {
      const name = req.body.name.trim();

      if (name.length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters",
        });
      }

      user.name = name;
    }

    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (
      req.body.password !== undefined &&
      req.body.password.trim() !== ""
    ) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    return res.status(500).json({
      message: error.message || "Profile could not be updated",
    });
  }
};

// GET /api/users
// Admin: get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: error.message || "Users could not be loaded",
    });
  }
};

// GET /api/users/:id
// Admin: get one user
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      message: error.message || "User could not be loaded",
    });
  }
};

// PUT /api/users/:id
// Admin: update user
const updateUserByAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.body.name !== undefined) {
      const name = req.body.name.trim();

      if (name.length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters",
        });
      }

      user.name = name;
    }

    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);

      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (req.body.isAdmin !== undefined) {
      user.isAdmin = Boolean(req.body.isAdmin);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    return res.status(500).json({
      message: error.message || "User could not be updated",
    });
  }
};

// DELETE /api/users/:id
// Admin: delete user
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: error.message || "User could not be deleted",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
};