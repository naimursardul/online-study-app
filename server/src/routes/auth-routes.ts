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
  credentialsLoginSuccess,
  logout,
  sendOtp,
  verifyOtp,
} from "../controllers/auth-controller";
import passport from "passport";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post(
  "/create-user",
  createUser,
  passport.authenticate("local"),
  credentialsLoginSuccess
);
router.post("/login", passport.authenticate("local"), credentialsLoginSuccess);
router.get("/logout", logout);
router.get("/check-auth", checkAuth);

export default router;
