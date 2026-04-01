/*
 * Title: Auth Controller
 * Description: Authentication controller for handling user login and registration
 * Author: Naimur Rahman
 * Date: 2025-06-30
 * updated: 2026-03-26
 *
 */

import { NextFunction, Request, Response } from "express";
import User from "../models/user-model";
import bcryptjs from "bcryptjs";
import { createJWT } from "../utils/jwt-token";
import jwt from "jsonwebtoken";
import { IUser } from "../type/type";

// Send OTP to user through phone number
export const sendOtp = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 11) {
    res.status(200).json({ success: false, message: "Invalid phone number" });
    return;
  }

  try {
    // Check if user already exists
    const userExisted = await User.findOne({ phone });
    if (userExisted) {
      res.status(200).json({ success: false, message: "User already exists" });
      return;
    }

    // Hashing password
    const hashedPassword = await bcryptjs.hash(password, 10);
    // Generate OTP (for simplicity, using a static OTP)
    // const otp = Math.floor(Math.random() * 1000000).toString();
    const otp = "123456";

    const newUser = await User.create({
      phone,
      password: hashedPassword,
      verificationToken: otp,
      verificationTokenExpireAt: Date.now() + 2 * 60 * 1000, // OTP valid for 2 minutes
    });
    res.status(200).json({ success: true, message: "OTP sent successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Error in Server side." });
    return;
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 11) {
    res
      .status(200)
      .json({ success: false, message: "Invalid phone number", data: null });
    return;
  }

  try {
    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      res
        .status(200)
        .json({ success: false, message: "User not found", data: null });
      return;
    }

    console.log(user);
    // Check if OTP is valid and not expired
    if (
      user.verificationToken !== otp ||
      (user.verificationTokenExpireAt &&
        Date.now() > user.verificationTokenExpireAt.getTime())
    ) {
      res.status(200).json({
        success: false,
        message: "Invalid or expired OTP",
        data: null,
      });
      return;
    }

    //  reset verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: user,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Error in Server side.", data: null });
    return;
  }
};

// Create User
export const createUser = async (req: Request, res: Response) => {
  const { phone, name, email, img, level, background } = req.body;

  if (
    !phone ||
    phone.length !== 11 ||
    !name ||
    !email ||
    !img ||
    !level ||
    !background
  ) {
    res.status(200).json({
      success: false,
      message: "All fields must be fillid in.",
      data: null,
    });
    return;
  }

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      {
        name,
        email,
        img,
        level,
        background,
        lastLogin: new Date(),
      },
      { new: true }
    )
      .populate("level", "name")
      .populate("background", "name");

    if (!user) {
      res
        .status(200)
        .json({ success: false, message: " User not found.", data: null });
      return;
    }

    // 🔥 CREATE JWT
    const token = createJWT({
      _id: user?._id,
      userCategory: user?.userCategory,
      role: user?.role,
    });

    // 🔥 SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: `User created successfully.`,
      user: user,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Error in Server side.", data: null });
    return;
  }
};

// requireAuth middleware to protect routes
export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(200).json({ success: false, message: "No token found!" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Error in Server side." });
    return;
  }
};

// check auth
export const checkAuth = async (req: any, res: Response) => {
  try {
    const data = await User.findById(req.user.userId)
      .populate("level", "name")
      .populate("background", "name");

    if (!data) {
      res.status(200).json({
        success: false,
        message: "User not found",
        user: null,
      });
      return;
    }

    const userObj = data.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "User found",
      user: userObj,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in server",
      user: null,
    });
    return;
  }
};

// Login with phone
export const loginWithPhone = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // ✅ Basic validation
  if (!phone || phone.length !== 11 || !password) {
    res.status(200).json({
      success: false,
      message: "Phone and password are required",
    });
    return;
  }

  try {
    // ✅ Find user
    const user = await User.findOne({
      phone,
      isVerified: true,
      provider: "phone",
    })
      .populate("level", "name")
      .populate("background", "name");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.password) {
      res.status(200).json({
        success: false,
        message: "Password not found. Please contact with admin.",
      });
      return;
    }
    // ✅ Compare password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // ✅ Update last login
    user.lastLogin = new Date();
    await user.save();

    // 🔥 Generate JWT
    const token = createJWT(user);

    // 🔥 Set cookie (IMPORTANT for Vercel)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // ✅ Send response (never send password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
    return;
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
    return;
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in server",
    });
    return;
  }
};
