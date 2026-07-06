import { Request, Response } from "express";
import { SavedQuestion } from "../models/saved-question-model";
import mongoose from "mongoose";
import { CQ, MCQ } from "../models/question-model";

const questionModelMap: Record<string, mongoose.Model<any>> = {
  CQ: CQ,
  MCQ: MCQ,
};

// TOGGLE save/unsave a question in a collection
export async function toggleSavedQuestion(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const {
      collectionId,
      questionId,
      questionType,
      subjectId,
      chapterId,
      topicId,
    } = req.body;

    if (!collectionId || !questionId || !questionType) {
      res.status(200).json({
        success: false,
        message: "collectionId, questionId, questionType are required",
      });
      return;
    }

    const existing = await SavedQuestion.findOne({
      userId,
      collectionId,
      questionId,
    });

    if (existing) {
      await existing.deleteOne();
      res.status(200).json({ success: true, saved: false });
      return;
    }

    const saved = await SavedQuestion.create({
      userId,
      collectionId,
      questionId,
      questionType,
      subjectId,
      chapterId,
      topicId,
    });

    res.status(201).json({ success: true, saved: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// GET all collectionIds where this question is already saved (for showing checkmarks in popover)
export async function getSavedStatus(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { questionId } = req.params;

    const savedEntries = await SavedQuestion.find({
      userId,
      questionId,
    }).select("collectionId");

    const collectionIds = savedEntries.map((entry) =>
      entry.collectionId.toString(),
    );

    res.status(200).json({ success: true, data: collectionIds });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// GET questions inside one collection - with pagination + filter by subject/chapter
export async function getQuestionsInCollection(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const { collectionId } = req.params;
    const { page = "1", subjectId, chapterId } = req.query;

    const limit = 20;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * limit;

    // build filter
    const filter: Record<string, any> = { userId, collectionId };
    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;

    const total = await SavedQuestion.countDocuments(filter);

    const savedQuestions = await SavedQuestion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // group question ids by type, so we call each Question model only once
    const idsByType: Record<string, string[]> = {};
    for (const sq of savedQuestions) {
      if (!idsByType[sq.questionType]) idsByType[sq.questionType] = [];
      idsByType[sq.questionType].push(sq.questionId.toString());
    }

    // fetch real question details from correct models
    const questionsById: Record<string, any> = {};
    for (const type of Object.keys(idsByType)) {
      const Model = questionModelMap[type];
      if (!Model) continue;
      const docs = await Model.find({ _id: { $in: idsByType[type] } });
      for (const doc of docs) {
        questionsById[doc._id.toString()] = doc;
      }
    }

    const result = savedQuestions
      .map((sq) => questionsById[sq.questionId.toString()] || null)
      .filter((q) => q !== null);

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page: pageNumber,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
