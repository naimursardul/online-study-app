import mongoose, { Schema, Document } from "mongoose";
import { ITopic } from "../type/type";

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    level: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    background: [
      {
        type: Schema.Types.ObjectId,
        ref: "Background",
        required: true,
      },
    ],
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  },
  { timestamps: true }
);

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
