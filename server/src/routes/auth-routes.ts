/*
 * Title: Auth Routes
 * Description: Auuthentication routes for the application
 * Author: Naimur Rahman
 * Date: 2025-06-30
 *
 */

import express from "express";
import {
  checkAuth,
  createUser,
  loginWithPhone,
  logout,
  requireAuth,
  sendOtp,
  verifyOtp,
} from "../controllers/auth-controller";
import {
  authIpLimiter,
  createUserLimiter,
  loginLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
} from "../middlewares/rate-limit";

const router = express.Router();

// Two layers per public route: a shared per-IP backstop, then a per-phone
// budget so one carrier's CGNAT pool can't lock out its own users.
router.post("/send-otp", authIpLimiter, sendOtpLimiter, sendOtp);
router.post("/verify-otp", authIpLimiter, verifyOtpLimiter, verifyOtp);
router.post("/create-user", authIpLimiter, createUserLimiter, createUser);
router.post("/login-with-phone", authIpLimiter, loginLimiter, loginWithPhone);
router.get("/logout", requireAuth, logout);
router.get("/check-auth", requireAuth, checkAuth);

export default router;
