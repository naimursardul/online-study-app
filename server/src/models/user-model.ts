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
    // Excluded by default so no query can accidentally serialize the hash.
    // loginWithPhone opts back in with .select("+password") to run the compare.
    password: { type: String, select: false },
    // Same reasoning: these are credentials, not profile data.
    verificationToken: { type: String, select: false },
    resetToken: { type: String, select: false },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
    background: {
      type: Schema.Types.ObjectId,
      ref: "Background",
    },
    verificationTokenExpireAt: { type: Date },
    resetTokenExpireAt: { type: Date },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
