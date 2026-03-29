// ===== models/level-model.ts =====
import mongoose, { Schema } from "mongoose";
import { ILevel } from "../type/type";

const levelSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    details: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Level = mongoose.model<ILevel>("Level", levelSchema);
export default Level;
