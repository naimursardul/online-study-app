/*
 * Title: Auth Controller
 * Description: Authentication controller for handling user login and registration
 * Author: Naimur Rahman
 * Date: 2025-06-30
 *
 */

import { NextFunction, Request, Response } from "express";
import User from "../models/user-model";
import bcryptjs from "bcryptjs";

// Send OTP to user through phone number
export const sendOtp = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 11) {
    res
      .status(200)
      .json({ success: false, message: "Invalid phone number", data: null });
    return;
  }

  try {
    // Check if user already exists
    const userExisted = await User.findOne({ phone });
    if (userExisted) {
      res
        .status(200)
        .json({ success: false, message: "User already exists", data: null });
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
    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", data: newUser });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Error in Server side.", data: null });
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

    // Update user's last login time and reset verification token
    user.lastLogin = new Date();
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
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const user = await User.findOne({ phone });

    if (!user) {
      res
        .status(200)
        .json({ success: false, message: " User not found.", data: null });
      return;
    }

    user.name = name;
    user.email = email;
    user.img = img;
    user.level = level;
    user.background = background;

    await user.save();

    next();
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Error in Server side.", data: null });
    return;
  }
};

// Credentials Login success
export const credentialsLoginSuccess = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(200).json({
      success: false,
      message: `Email not verified successfully.`,
      user: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: `Email verified successfully.`,
    user: req.user,
  });
  return;
};

// CHECK AUTH
export const checkAuth = async (req: Request, res: Response) => {
  try {
    if (!req?.user) {
      res
        .status(400)
        .json({ success: false, message: "User not found.", user: null });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: `User found`, user: req.user });
    return;
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: `Error in server side.`, user: null });
    return;
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    req.logout((err: any) => {
      if (err) throw Error(err);
    });

    res
      .status(200)
      .json({ success: true, message: `User logged out successfully.` });

    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error in server side.` });
    return;
  }
};
