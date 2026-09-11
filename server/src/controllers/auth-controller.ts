/*
 * Title: Auth Controller
 * Description: Authentication controller for handling user login and registration
 * Author: Naimur Rahman
 * Date: 2025-06-30
 * updated: 2026-03-26
 *
 */

import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "node:crypto";
import User from "../models/user-model";
import bcryptjs from "bcryptjs";
import { createJWT } from "../utils/jwt-token";
import { IUser } from "../type/type";
import {
  authCookieOptions,
  SIGNUP_GRANT_COOKIE,
  SIGNUP_GRANT_TTL_MS,
  signupGrantCookieOptions,
} from "../config/cookie";
import { resolveSessionUser } from "../middlewares/session";

// Send OTP to user through phone number
export const sendOtp = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 11) {
    res.status(400).json({ success: false, message: "Invalid phone number" });
    return;
  }

  try {
    // Check if user already exists
    const userExisted = await User.findOne({ phone });
    if (userExisted) {
      res.status(409).json({ success: false, message: "User already exists" });
      return;
    }

    // Hashing password
    const hashedPassword = await bcryptjs.hash(password, 10);
    // Generate OTP (for simplicity, using a static OTP)
    // const otp = Math.floor(Math.random() * 1000000).toString();
    const otp = "123456";

    await User.create({
      phone,
      password: hashedPassword,
      // Hashed, not stored raw — matching the reset flow. Whoever can read the
      // users collection must not be able to replay a pending signup.
      verificationToken: await bcryptjs.hash(otp, 10),
      verificationTokenExpireAt: Date.now() + 2 * 60 * 1000, // OTP valid for 2 minutes
    });
    res.status(200).json({ success: true, message: "OTP sent successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error in Server side." });
    return;
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 11) {
    res
      .status(400)
      .json({ success: false, message: "Invalid phone number", data: null });
    return;
  }

  try {
    // verificationToken is select:false, but the OTP comparison below needs it.
    const user = await User.findOne({ phone }).select("+verificationToken");
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
      return;
    }

    // Check if OTP is valid and not expired. Both conditions are hard
    // requirements: a missing expiry used to be treated as "never expires".
    const otpMatches =
      typeof user.verificationToken === "string" &&
      (await bcryptjs.compare(String(otp), user.verificationToken));
    const notExpired =
      Boolean(user.verificationTokenExpireAt) &&
      Date.now() <= user.verificationTokenExpireAt!.getTime();

    if (!otpMatches || !notExpired) {
      res.status(401).json({
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

    // Issue the single-use signup grant. create-user requires it, which is what
    // binds step 3 of the flow to steps 1-2 *in this session*: before this,
    // create-user trusted a body-supplied phone and would mint a 7-day session
    // for any registered number.
    const grant = crypto.randomBytes(32).toString("hex");
    user.signupGrantToken = await bcryptjs.hash(grant, 10);
    user.signupGrantExpireAt = new Date(Date.now() + SIGNUP_GRANT_TTL_MS);
    await user.save();

    res.cookie(
      SIGNUP_GRANT_COOKIE,
      `${String(user._id)}.${grant}`,
      signupGrantCookieOptions,
    );
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: null,
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
//
// Step 3 of signup: send-otp -> verify-otp -> create-user. Identity comes from
// the signup grant cookie issued by verify-otp, never from req.body.phone.
// Before that grant existed, POSTing any registered phone number here returned a
// valid 7-day session for that account and overwrote its profile on the way in.
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
    res.status(400).json({
      success: false,
      message: "All fields must be fillid in.",
      data: null,
    });
    return;
  }

  // Generic message for every grant failure: a caller must not be able to tell
  // "no grant" from "wrong phone for this grant" from "already used".
  const rejectGrant = () => {
    res.clearCookie(SIGNUP_GRANT_COOKIE, signupGrantCookieOptions);
    res.status(401).json({
      success: false,
      message: "Verify your phone number before completing signup.",
      data: null,
    });
  };

  const rawGrant = req.cookies?.[SIGNUP_GRANT_COOKIE];
  if (typeof rawGrant !== "string" || !rawGrant.includes(".")) {
    rejectGrant();
    return;
  }

  const separator = rawGrant.indexOf(".");
  const grantUserId = rawGrant.slice(0, separator);
  const grantSecret = rawGrant.slice(separator + 1);
  if (!mongoose.isValidObjectId(grantUserId) || !grantSecret) {
    rejectGrant();
    return;
  }

  try {
    const user = await User.findById(grantUserId).select("+signupGrantToken");

    if (
      !user ||
      // The grant is single-use: consuming it clears both fields below.
      typeof user.signupGrantToken !== "string" ||
      !user.signupGrantExpireAt ||
      Date.now() > user.signupGrantExpireAt.getTime() ||
      !(await bcryptjs.compare(grantSecret, user.signupGrantToken)) ||
      // The grant is only issued after a successful OTP check, but assert it
      // rather than infer it.
      user.isVerified !== true ||
      // Cross-check the body against the grant so a grant for one number can't
      // complete a different account.
      user.phone !== phone
    ) {
      rejectGrant();
      return;
    }

    // Replay guard for an established account: a completed profile means this is
    // no longer a signup, so refuse rather than overwrite name/email/level.
    if (user.name && user.email) {
      res.clearCookie(SIGNUP_GRANT_COOKIE, signupGrantCookieOptions);
      res.status(409).json({
        success: false,
        message: "This account is already set up. Please log in instead.",
        data: null,
      });
      return;
    }

    user.name = name;
    user.email = email;
    user.img = img;
    user.level = level;
    user.background = background;
    user.lastLogin = new Date();
    // Consume the grant in the same write that completes the profile.
    user.signupGrantToken = undefined;
    user.signupGrantExpireAt = undefined;
    await user.save();

    await user.populate("level", "name");
    await user.populate("background", "name");

    // 🔥 CREATE JWT
    const token = createJWT(user);

    // 🔥 SET COOKIE
    res.clearCookie(SIGNUP_GRANT_COOKIE, signupGrantCookieOptions);
    res.cookie("token", token, authCookieOptions);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.signupGrantToken;

    res.status(201).json({
      success: true,
      message: `User created successfully.`,
      user: userObj,
    });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error in Server side.", data: null });
    return;
  }
};

// requireAuth middleware to protect routes
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await resolveSessionUser(req.cookies?.token);

  if (!result.ok) {
    // One message per reason, all 401. Nothing here reveals whether the user
    // exists — "no-user" and "invalid-token" read identically to a caller.
    const message =
      result.reason === "no-token"
        ? "No token found!"
        : result.reason === "password-changed"
          ? "Session expired. Please log in again."
          : "Unauthorized.";
    res.status(401).json({ success: false, message, user: null });
    return;
  }

  req.user = result.user;
  next();
};

// check auth
export const checkAuth = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      // Unreachable behind requireAuth (which 401s first), but this branch
      // must not answer 200 with success:false — see the status-code gate.
      res.status(401).json({
        success: false,
        message: "Unauthorized! User not found.",
        user: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User found",
      user: req.user,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
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
    res.status(400).json({
      success: false,
      message: "Phone and password are required",
    });
    return;
  }

  try {
    // password is select:false; opt back in for the compare below.
    const user = await User.findOne({
      phone,
      isVerified: true,
      provider: "phone",
    })
      .select("+password")
      .populate("level", "name")
      .populate("background", "name");

    // A5.6: one identical, vague 401 for "no such user" and "wrong
    // password" — distinguishing them would let a caller enumerate which
    // phone numbers have accounts.
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        success: false,
        message: "Password not found. Please contact with admin.",
      });
      return;
    }
    // ✅ Compare password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
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

    // 🔥 Set cookie
    res.cookie("token", token, authCookieOptions);

    // The hash was explicitly selected for the compare above, so drop it before
    // the document goes out over the wire.
    const { password: _hash, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
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
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", authCookieOptions);

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

// ============================================================
// PASSWORD RESET FLOW (phone OTP) — three steps mirroring signup
// ============================================================

// Shared lookup for all three steps, so they can't drift on who is eligible:
// only a verified, password-backed account can hold a reset token, which keeps
// OAuth users from being pushed through a flow that would strand them.
// resetToken is select:false — opt back in for the compares in steps 2 and 3.
const findResettableUser = (phone: string) =>
  User.findOne({ phone, isVerified: true, provider: "phone" }).select(
    "+resetToken",
  );

// One message for every failed check — wrong digits, expired token, or no such
// account. Distinguishing them would turn these endpoints into an oracle for
// "is this number registered?".
const INVALID_OTP = "Invalid or expired OTP";

// True when `otp` matches the user's live, unexpired reset token.
const resetOtpMatches = async (user: IUser, otp: string) => {
  // Pulled into consts so TS keeps the non-null narrowing across the
  // Date/getTime calls before bcryptjs.compare reads the hash.
  const hashedOtp = user.resetToken;
  const expiresAt = user.resetTokenExpireAt;
  if (!hashedOtp || !expiresAt || Date.now() > expiresAt.getTime()) {
    return false;
  }
  return bcryptjs.compare(otp, hashedOtp);
};

// Step 1: issue a reset OTP for a phone number
export const forgotPassword = async (req: Request, res: Response) => {
  const { phone } = req.body;

  try {
    const user = await findResettableUser(phone);

    // Unknown numbers get the same 200 as real ones. A 404 here would confirm
    // which phones have accounts; the per-phone rate limit is what bounds abuse.
    if (user) {
      // Static OTP until an SMS provider is chosen.
      // TODO: generate a random 6-digit OTP and sendSms(phone, otp).
      const otp = "123456";

      // Hashed at rest so a DB leak can't expose a live reset code. resetToken
      // is select:false; assigning + saving an unselected field still persists it.
      user.resetToken = await bcryptjs.hash(otp, 10);
      user.resetTokenExpireAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      await user.save();
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error in Server side." });
    return;
  }
};

// Step 2: verify the OTP without consuming it (step 3 re-checks it)
export const verifyResetOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  try {
    const user = await findResettableUser(phone);
    if (!user || !(await resetOtpMatches(user, otp))) {
      res.status(401).json({ success: false, message: INVALID_OTP });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error in Server side." });
    return;
  }
};

// Step 3: re-check the OTP, set the new password, and kill old sessions
export const resetPassword = async (req: Request, res: Response) => {
  const { phone, otp, password } = req.body;

  try {
    const user = await findResettableUser(phone);
    if (!user || !(await resetOtpMatches(user, otp))) {
      res.status(401).json({ success: false, message: INVALID_OTP });
      return;
    }

    user.password = await bcryptjs.hash(password, 10);
    // Invalidates JWTs issued earlier. Backdated 1s because JWT iat is floored
    // to whole seconds: a token minted in the same second as the reset would
    // otherwise look "issued before" it and requireAuth would bounce the user
    // straight back to login.
    user.passwordChangedAt = new Date(Date.now() - 1000);
    user.resetToken = undefined;
    user.resetTokenExpireAt = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error in Server side." });
    return;
  }
};
