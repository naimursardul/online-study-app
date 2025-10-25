import mongoose, { Schema } from "mongoose";
import { IUser } from "../type/type";

const UserSchema = new Schema(
  {
    name: { type: String },
    role: { type: String, default: "User" },
    userCategory: { type: String, default: "Regular" },
    isVerified: { type: Boolean, default: false },
    provider: { type: String, default: "Phone" },
    img: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    level: { type: String },
    background: { type: String },

    verificationToken: { type: String },
    verificationTokenExpireAt: { type: Date },
    resetToken: { type: String },
    resetTokenExpireAt: { type: Date },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
