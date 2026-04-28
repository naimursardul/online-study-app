import mongoose, { Schema } from "mongoose";
import { ITopic } from "../type/type";

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    levelId: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    backgroundId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Background",
        required: true,
      },
    ],
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  },
  { timestamps: true }
);

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
