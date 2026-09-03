/*
 * Title: Question Model
 * Description: Question model for every question type. All types live in the
 *              `questions` collection behind the `questionType` discriminator
 *              key and share `baseQuestionSchema`. Shapes come in three
 *              families — see utils/question-types.ts.
 * Author: Naimur Rahman
 * Date: 2025-04-09
 */

import mongoose, { Schema } from "mongoose";
import { IBaseQuestion, ICQ, IMCQ, IWritten } from "../type/type";
import {
  QUESTION_TYPE_CODES,
  QuestionTypeCode,
} from "../utils/question-types";

// -----------------------
// Schemas
// -----------------------

const baseQuestionSchema = new Schema<IBaseQuestion>(
  {
    questionType: {
      type: String,
      enum: QUESTION_TYPE_CODES,
      required: true,
    },
    backgroundId: [
      {
        type: String,
        required: true,
      },
    ],
    levelId: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    chapterId: {
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
  },
);

// -----------------------
// Indexes
// -----------------------

// Covers the taxonomy filters used by the question list endpoint; without it a
// filtered skip/limit + countDocuments collection-scans on every page turn.
baseQuestionSchema.index({
  questionType: 1,
  levelId: 1,
  subjectId: 1,
  chapterId: 1,
  topicId: 1,
});
baseQuestionSchema.index({ recordId: 1 });

// -----------------------
// Models
// -----------------------

const BaseQuestion = mongoose.model<IBaseQuestion>(
  "BaseQuestion",
  baseQuestionSchema,
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
        validator: (options: String[]) => {
          return options.length === 4;
        },
        message: "Options must have exactly 4 choices.",
      },
      {
        validator: (options: String[]) => {
          return options.every((option) => {
            return option?.trim();
          });
        },
        message: "Each option must contain text or image.",
      },
    ],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
});

const MCQ = BaseQuestion.discriminator<IMCQ>("MCQ", mcqSchema);

// CQ Schema
// Built by a factory because the CQ family differs only in how many
// sub-questions it expects: CQ has 4 (ক/খ/গ/ঘ), Math-CQ has 3 (ক/খ/গ).
// Fresh definition objects per call so the two schemas never share state.
const makeCqSchema = (subQuestionCount: number) =>
  new Schema<ICQ>({
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
          chapterId: {
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
          validator: (val: unknown[]) => val.length === subQuestionCount,
          message: `Sub Questions must be exactly ${subQuestionCount}.`,
        },
      ],
    },
  });

const CQ = BaseQuestion.discriminator<ICQ>("CQ", makeCqSchema(4));
const MathCQ = BaseQuestion.discriminator<ICQ>("Math-CQ", makeCqSchema(3));

// Written Schema
// SQ (short question), EQ (English question) and WQ (written question) are the
// same `question + answer` shape under different names, so they share a schema
// factory and only the discriminator value differs.
const makeWrittenSchema = () =>
  new Schema<IWritten>({
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  });

const SQ = BaseQuestion.discriminator<IWritten>("SQ", makeWrittenSchema());
const EQ = BaseQuestion.discriminator<IWritten>("EQ", makeWrittenSchema());
const WQ = BaseQuestion.discriminator<IWritten>("WQ", makeWrittenSchema());

// -----------------------
// Registry
// -----------------------

// Controllers resolve the model from the request's questionType through this
// map instead of branching per type.
const questionModels: Record<QuestionTypeCode, mongoose.Model<any>> = {
  MCQ,
  CQ,
  "Math-CQ": MathCQ,
  SQ,
  EQ,
  WQ,
};

// -----------------------

export { BaseQuestion, MCQ, CQ, MathCQ, SQ, EQ, WQ, questionModels };
