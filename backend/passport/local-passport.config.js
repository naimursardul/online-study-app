/*
 * Title: Local Passport
 * Description: Email-password passport config
 * Author: Naimur Rahman
 * Date: 2024-11-03
 *
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, cb) {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return cb(null, false, "User not found");
        }

        bcrypt.compare(password, user._doc.password, function (err, isMatched) {
          if (err) {
            throw new Error(err);
          }
          if (!isMatched) {
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }
          return cb(null, user._doc);
        });
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);
