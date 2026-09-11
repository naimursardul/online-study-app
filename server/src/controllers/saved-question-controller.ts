import { Request, Response } from "express";
import { SavedQuestion } from "../models/saved-question-model";
import Collection from "../models/collection-model";
import mongoose from "mongoose";
import { questionModels } from "../models/question-model";

// Bookmarks resolve their full question from the registry, so every supported
// question type is fetchable without touching this file again. Widened to a
// string key because the lookup value comes from stored bookmark rows.
const questionModelMap: Record<string, mongoose.Model<any> | undefined> =
  questionModels;

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
      res.status(400).json({
        success: false,
        message: "collectionId, questionId, questionType are required",
      });
      return;
    }

    // A5.1: confirm the target collection belongs to the caller before
    // writing into it. Without this, a user could insert SavedQuestion rows
    // into any other user's collection — reads are userId-scoped so the
    // victim never sees them, but the cross-tenant write was silent.
    const ownsCollection = await Collection.exists({
      _id: collectionId,
      userId,
    });
    if (!ownsCollection) {
      // 404, not 403: a foreign collection id must be indistinguishable
      // from a nonexistent one.
      res.status(404).json({
        success: false,
        message: "Collection not found",
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
      res.status(200).json({ success: true, data: { saved: false } });
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

    res.status(201).json({ success: true, data: { saved: true, item: saved } });
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

    // A bookmark can outlive its question (taxonomy cascade, or a question deleted
    // from the admin panel). Dropping the row here would make the page show fewer
    // rows than `total` promises, so it goes out as a placeholder instead.
    const result = savedQuestions.map((sq) => {
      const q = questionsById[sq.questionId.toString()];
      if (q) return q;
      return {
        _id: sq.questionId,
        questionType: sq.questionType,
        unavailable: true,
      };
    });

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
