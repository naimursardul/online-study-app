import mongoose, { Schema } from "mongoose";
import { IBackground } from "../type/type";

const backgroundSchema = new Schema<IBackground>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Background = mongoose.model<IBackground>("Background", backgroundSchema);

export default Background;
