import mongoose, { Schema, Document } from "mongoose";
import { IAnswer } from "../type/type";

const AnswerSchema = new Schema<IAnswer>(
  {
    u_id: { type: String, required: true, index: true },

    examName: { type: String, required: true },

    answerScript: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "BaseQuestion",
          required: true,
        },

        givenAns: {
          type: String,
          required: true,
        },

        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],

    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },

    percentage: { type: Number, required: true },

    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },

    timeTaken: { type: Number, required: true },

    examDate: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

const Answer = mongoose.model<IAnswer>("Answer", AnswerSchema);
export default Answer;
