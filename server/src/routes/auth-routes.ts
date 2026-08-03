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
import { authLimiter } from "../middlewares/rate-limit";

const router = express.Router();

// All four public routes share ONE limiter instance: 5 failed
// attempts per IP per 15 min across the whole group (successes don't count).
router.post("/send-otp", authLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/create-user", authLimiter, createUser);
router.post("/login-with-phone", authLimiter, loginWithPhone);
router.get("/logout", requireAuth, logout);
router.get("/check-auth", requireAuth, checkAuth);

export default router;
