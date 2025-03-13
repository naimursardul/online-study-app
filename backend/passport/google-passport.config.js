/*
 * Title: Google Passport
 * Description: Google passport config
 * Author: Naimur Rahman
 * Date: 2024-10-26
 *
 */

import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";
import { User } from "../models/userModel.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      const { email, name: username, picture: img } = profile?._json;
      try {
        const existedUser = await User.findOne({ email });
        if (existedUser) {
          existedUser.lastLogin = Date.now();
          existedUser.save();
          return cb(null, existedUser);
        }
        const newUser = await User.create({
          provider: profile?.provider,
          email,
          username,
          img,
          lastLogin: Date.now(),
        });

        await newUser.save();
        return cb(null, newUser);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);
