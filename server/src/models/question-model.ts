/*
 * Title: Question Model
 * Description: Question model for both MCQ & CQ
 * Author: Naimur Rahman
 * Date: 2025-04-09
 */

import mongoose, { Schema } from "mongoose";
import { IBaseQuestion, ICQ, IMCQ } from "../type/type";

// -----------------------
// Schemas
// -----------------------

const baseQuestionSchema = new Schema<IBaseQuestion>(
  {
    questionType: {
      type: String,
      enum: ["MCQ", "CQ"],
      required: true,
    },
    background: [
      {
        type: String,
        required: true,
      },
    ],
    backgroundId: [
      {
        type: String,
        required: true,
      },
    ],
    level: {
      type: String,
      required: true,
    },
    levelId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    topicId: {
      type: String,
      required: true,
    },
    recordId: [
      {
        type: String,
        required: true,
      },
    ],
    record: [
      {
        recordType: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: String,
          required: true,
        },
      },
    ],
    marks: {
      type: Number,
      required: true,
    },
    timeRequired: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "questionType",
    collection: "questions",
  }
);

// -----------------------
// Models
// -----------------------

const BaseQuestion = mongoose.model<IBaseQuestion>(
  "BaseQuestion",
  baseQuestionSchema
);

// MCQ Schema
const mcqSchema = new Schema<IMCQ>({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [
      {
        validator: (val: string[]) => val.length === 4,
        message: "Options must have exactly 4 choices.",
      },
    ],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (this: IMCQ, value: string) {
        return this.options.includes(value);
      },
      message: "Correct answer must be one of the provided options.",
    },
  },
  explanation: {
    type: String,
    required: true,
  },
});

const MCQ = BaseQuestion.discriminator<IMCQ>("MCQ", mcqSchema);

// CQ Schema
const cqSchema = new Schema<ICQ>({
  statement: {
    type: String,
    required: true,
  },
  subQuestions: {
    type: [
      {
        questionNo: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        topic: {
          type: String,
          required: true,
        },
        topicId: {
          type: String,
          required: true,
        },
      },
    ],
    validate: [
      {
        validator: (val: string[]) => val.length === 4,
        message: "Sub Questions must be exactly 4.",
      },
    ],
  },
});

const CQ = BaseQuestion.discriminator<ICQ>("CQ", cqSchema);

// -----------------------

export { BaseQuestion, MCQ, CQ };
