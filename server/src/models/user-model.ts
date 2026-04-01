import mongoose, { Schema } from "mongoose";
import { IUser } from "../type/type";

const UserSchema = new Schema(
  {
    name: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    userCategory: {
      type: String,
      enum: ["regular", "premium"],
      default: "regular",
    },
    isVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ["phone", "google"], default: "phone" },
    img: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
    background: {
      type: Schema.Types.ObjectId,
      ref: "Background",
    },
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
