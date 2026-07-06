import { Schema, model, Document, Types } from "mongoose";
import { ICollection } from "../type/type";

const collectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Collection = model<ICollection>("Collection", collectionSchema);
export default Collection;
