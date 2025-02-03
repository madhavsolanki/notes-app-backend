import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Note from "../models/notes.model.js";

// Import environment variables
dotenv.config();

// Register Controller
export const registerController = async (req, res) => {
  try {
    // check validation Results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, phoneNumber, email, password } = req.body;

    // Additional validation for empty fields (belt and suspenders approach)
    if (
      !fullName?.trim() ||
      !phoneNumber?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // Check if email exists (case insensitive)
    const userExists = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        error: "Email already exists. Please use a different email.",
      });
    }

    // Check if phone number exists
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        error: "Phone number already registered.",
      });
    }

    // Hash the Password
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new User Account
    const newUser = await User.create({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      return res
        .status(500)
        .json({ success: false, error: "Error in Creating User" });
    }

    // Return the User Object
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "An account with this email or phone number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error during registration",
    });
  }
};

// Login Controller
export const loginController = async (req, res) => {
  try {
    // check validation Results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array(),
      });
    }

    // taking User input
    const { email, password } = req.body;

    // check validation Results
    if (!email.trim() || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // Find the user by email
    // Find user by email (case insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+password"); // Explicitly include password since it's select: false

    // If user does not exist
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Comapare the password correct or not
    const isPasswordValid = await bcrypt.compare(password, user?.password);

    // If Password does not match
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid Credentials",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user?._id,
        email: user?.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove Sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;

    // Setup HttpOnlyCookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send Success response
    return res.status(200).json({
      success: true,
      message: "User Logged In Successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during login",
    });
  }
};

// Update User Profile
export const updateUserController = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;
    const userId = req.user._id;

    // Validate if userId is a valid MongoDB ObjectId **BEFORE** querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    // Fetch User From DB **AFTER** validating userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Update only provided fields
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Check if the new email is provided and ensure it's not already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists. Please use a different email.",
        });
      }
      user.email = email;
    }

    // Hash password if provided
    if (password) {
      const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    // Save updated user to DB
    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Send success response
    return res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Logout Controller
export const logoutController = async (req, res) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "User Logged Out Successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Error during logout",
    });
  }
};

// Delete User Account Controller
export const deleteUserAccoutController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Ensure userId is valid
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Delete all notes associated with the user
    await Note.deleteMany({ author: userId });

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User account and associated notes deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: `Error in Delting Account of User ${error}`,
    });
  }
};
