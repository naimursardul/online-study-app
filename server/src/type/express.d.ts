import mongoose from "mongoose";
import { IUser } from "../src/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: mongoose.Types.ObjectId };
    }
  }
}

export {};
