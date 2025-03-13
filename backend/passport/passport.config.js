/*
 * Title: Serialize-Deserialize User
 * Description: Serialize-Deserialize user, a passport method for persisting user.
 * Author: Naimur Rahman
 * Date: 2024-10-28
 *
 */

import passport from "passport";
import { User } from "../models/userModel.js";

passport.serializeUser(function (user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (error) {
    cb(error, null);
  }
});
