import mongoose, { Schema, model } from "mongoose";
import { IYear } from "../type/type";

const yearSchema = new Schema<IYear>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
  },
  { timestamps: true }
);

const Year = model<IYear>("Year", yearSchema);
export default Year;
