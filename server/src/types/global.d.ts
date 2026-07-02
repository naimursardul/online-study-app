import { Request } from "express";
import { IUser } from "../type/type";

declare module "express" {
  interface Request {
    user?: IUser & {
      _id: string;
    };
  }
}
