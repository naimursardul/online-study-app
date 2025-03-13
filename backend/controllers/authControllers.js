/*
 * Title: Auth Controller
 * Description: To controll every auth-routes.
 * Author: Naimur Rahman
 * Date: 2024-10-28
 *
 */

import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

// GOOGLE SIGNUP
const signUpWithGoogle = (req, res) => {
  res.status(200).json({ message: "User successfully logged in." });
};

// SIGNUP WITH CREDENTIALS
const signUpWithCredential = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please, fill in all the inputfields." });
  }

  bcrypt.hash(password, 10, async function (err, hashedPassword) {
    if (err) {
      console.log(`[HASHING ERROR]:${err}`);
      return res.status(400).json({ message: "Server Error" });
    }
    try {
      const existedUser = await User.findOne({ email });
      if (existedUser) {
        return res.status(400).json({ message: "User already existed." });
      }

      const newUser = await User.create({
        provider: "credential",
        email,
        password: hashedPassword,
        username,
        lastLogin: Date.now(),
      });
      await newUser.save();

      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Problem is server side." });
    }
  });
};

// UPDATE USER
const updateUser = async (req, res) => {
  const { username, email, password, level, background } = req.body;

  if (
    !level &&
    !background &&
    !username &&
    !email &&
    !password &&
    !level &&
    !background
  ) {
    res.status(400).json({ message: "Enter at least one field." });
  }

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        email,
        password: hashedPassword,
        username,
        level,
        background,
      },
      { new: true }
    );
    await user.save();
    return res.status(200).json({ message: "User updated sucessfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Problem is server side." });
  }
};

// LOGIN WITH CREDENTIALS
const loginWithCredential = (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User not found." });
  }
  res.status(200).json({ message: "User successfully logged in." });
};

// LOGOUT
const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(400).json({ message: "Problem in server side." });
    }
    res.status(200).json({ message: "Successfully logged out." });
  });
};

export {
  signUpWithGoogle,
  signUpWithCredential,
  updateUser,
  loginWithCredential,
  logout,
};
