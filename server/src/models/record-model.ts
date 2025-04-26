import { Schema, model } from "mongoose";
import { IRecord } from "../type/type";

const recordSchema = new Schema<IRecord>(
  {
    recordType: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: String, required: true },
  },
  { timestamps: true }
);

const Record = model<IRecord>("Record", recordSchema);
export default Record;
