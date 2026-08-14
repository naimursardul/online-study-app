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
  forgotPassword,
  loginWithPhone,
  logout,
  requireAuth,
  resetPassword,
  sendOtp,
  verifyOtp,
  verifyResetOtp,
} from "../controllers/auth-controller";
import {
  authIpLimiter,
  createUserLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  resetPasswordLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  verifyResetOtpLimiter,
} from "../middlewares/rate-limit";
import { validate } from "../middlewares/validate";
import {
  createUserSchema,
  forgotPasswordSchema,
  loginWithPhoneSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  verifyResetOtpSchema,
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

// Password reset: same layering as above (per-IP backstop, per-phone budget,
// then validate last so malformed bodies are still counted against the limit).
router.post(
  "/forgot-password",
  authIpLimiter,
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-reset-otp",
  authIpLimiter,
  verifyResetOtpLimiter,
  validate(verifyResetOtpSchema),
  verifyResetOtp,
);
router.post(
  "/reset-password",
  authIpLimiter,
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
router.get("/logout", requireAuth, logout);
router.get("/check-auth", requireAuth, checkAuth);

export default router;
