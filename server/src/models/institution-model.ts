import mongoose, { Schema, model } from "mongoose";
import { IInstitution } from "../type/type";

const institutionSchema = new Schema<IInstitution>(
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

const Institution = model<IInstitution>("Institution", institutionSchema);
export default Institution;
