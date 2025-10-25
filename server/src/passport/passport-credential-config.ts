/*
 * Title: Passport Credential Auth
 * Description: Passport Credential Auth
 * Author: Naimur Rahman
 * Date: 2025-10-12
 *
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user-model";
import { IUser } from "../type/type";

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "password",
    },
    async function verify(phone, password, cb) {
      if (!password || !phone) {
        return cb(null, false);
      }
      try {
        const user: (IUser & { _id: string }) | null = await User.findOne({
          phone,
          isVerified: true,
          provider: "Phone",
        });

        console.log(user);
        if (!user) {
          return cb("User not found.", false);
        }

        user?.password &&
          bcrypt.compare(
            password,
            user.password,
            async function (err, isMatched) {
              if (err) {
                throw new Error(err.message);
              }
              if (!isMatched) {
                return cb("Incorrect username or password.", false);
              }
              user.lastLogin = new Date();
              await user.save();

              return cb(null, user);
            }
          );
      } catch (error) {
        return cb(error, false);
      }
    }
  )
);
