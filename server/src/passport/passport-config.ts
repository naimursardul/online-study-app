/*
 * Title: Passport config
 * Description: Passport config
 * Author: Naimur Rahman
 * Date: 2025-10-12
 *
 */

import passport from "passport";
import User from "../models/user-model";

passport.serializeUser(function (user: any, cb) {
  cb(null, user._id);
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await User.findById(id).select("-password");
    cb(null, user);
  } catch (error) {
    cb(error, null);
  }
});
