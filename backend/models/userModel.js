/*
 * Title: User Schema
 * Description: schema from mongoose.
 * Author: Naimur Rahman
 * Date: 2024-10-26
 *
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    role: { type: String, default: "student" },
    level: { type: String },
    background: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: String,
    img: String,
    totalMarks: { type: Number, default: 0 },
    examJoined: { type: Number, default: 0 },
    averagePercent: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
