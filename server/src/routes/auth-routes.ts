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
import { validate } from "../middlewares/validate";
import {
  createUserSchema,
  loginWithPhoneSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/auth.validation";

const router = express.Router();

// Two layers per public route: a shared per-IP backstop, then a per-phone
// budget so one carrier's CGNAT pool can't lock out its own users.
// validate runs LAST: the per-phone limiters key on req.body.phone, so
// rejecting malformed bodies earlier would let an attacker dodge the count.
router.post(
  "/send-otp",
  authIpLimiter,
  sendOtpLimiter,
  validate(sendOtpSchema),
  sendOtp,
);
router.post(
  "/verify-otp",
  authIpLimiter,
  verifyOtpLimiter,
  validate(verifyOtpSchema),
  verifyOtp,
);
router.post(
  "/create-user",
  authIpLimiter,
  createUserLimiter,
  validate(createUserSchema),
  createUser,
);
router.post(
  "/login-with-phone",
  authIpLimiter,
  loginLimiter,
  validate(loginWithPhoneSchema),
  loginWithPhone,
);
router.get("/logout", requireAuth, logout);
router.get("/check-auth", requireAuth, checkAuth);

export default router;
