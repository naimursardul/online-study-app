import jwt from "jsonwebtoken";
import { IUser } from "../type/type";
import { Types } from "mongoose";
import { env } from "../config/env";

export const createJWT = (
  user: IUser & {
    _id: Types.ObjectId;
  },
) => {
  return jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
      userCategory: user.userCategory,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};
