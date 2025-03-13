/*
 * Title: Auth Routes
 * Description: All auth routes.
 * Author: Naimur Rahman
 * Date: 2024-10-26
 *
 */

import express from "express";
import passport from "passport";
import {
  logout,
  signUpWithGoogle,
  signUpWithCredential,
  loginWithCredential,
  updateUser,
} from "../controllers/authControllers.js";
import { checkAuth } from "../middleware.js";

const router = express.Router();

// google login popup
router.get(
  "/signup-with-google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// google login callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  signUpWithGoogle
);

// signup with local authentication
router.post(
  "/signup",
  signUpWithCredential,
  passport.authenticate("local"),
  loginWithCredential
);

// login with local authentication
router.post("/login", passport.authenticate("local"), loginWithCredential);

// update user
router.put("/edit-user", checkAuth, updateUser);

// logout
router.post("/logout", logout);

export default router;
