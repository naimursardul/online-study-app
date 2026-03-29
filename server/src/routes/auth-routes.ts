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

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-user", createUser);
router.post("/login-with-phone", loginWithPhone);
router.get("/logout", requireAuth, logout);
router.get("/check-auth", requireAuth, checkAuth);

export default router;
