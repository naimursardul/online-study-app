import { Request, Response } from "express";
import Topic from "../models/topic-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Topic
export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, levelId, backgroundId, subjectId, chapterId } = req.body;

    if (!name || !levelId || !backgroundId || !subjectId || !chapterId) {
      res.status(200).json({
        success: false,
        message:
          "Name, levelId, backgroundId, subjectId, and chapterId are required.",
        data: null,
      });
      return;
    }

    const existing = await Topic.findOne({
      name,
      levelId,
      subjectId,
      chapterId,
    });

    if (existing) {
      res.status(200).json({
        success: false,
        message: "Topic already exists with this level, subject, and chapter.",
        data: null,
      });
      return;
    }

    const newTopic = new Topic({
      name,
      levelId,
      backgroundId,
      subjectId,
      chapterId,
    });

    await newTopic.save();

    res.status(200).json({
      success: true,
      message: "Topic created successfully.",
      data: newTopic,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Get All Topics (with optional filters)
export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const { levelId, backgroundId, subjectId, chapterId, search } = req.query;

    const filter: any = {};

    if (levelId) filter.levelId = levelId;

    if (backgroundId) {
      filter.backgroundId = Array.isArray(backgroundId)
        ? backgroundId
        : [backgroundId];
    }

    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;
    // ✅ SEARCH IMPLEMENTATION
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    const topics = await Topic.find(filter)
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name")
      .populate("chapterId", "name");

    res.status(200).json({
      success: true,
      message: "Topics fetched successfully.",
      data: topics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Get Single Topic
export const getSingleTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const topic = await Topic.findById(id)
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name")
      .populate("chapterId", "name");

    if (!topic) {
      res.status(404).json({
        success: false,
        message: "Topic not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Topic fetched successfully.",
      data: topic,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Update Topic and related BaseQuestions
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const topic = await Topic.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name")
      .populate("chapterId", "name");

    if (!topic) {
      res.status(404).json({
        success: false,
        message: "Topic not found.",
        data: null,
      });
      return;
    }

    const questions = await BaseQuestion.find({ topicId: id });

    for (const question of questions) {
      question.topic = topic.name;
      question.topicId = topic._id.toString();

      // level
      if (topic.levelId && typeof topic.levelId === "object") {
        const level = topic.levelId as unknown as IPopulatedData;
        question.level = level.name;
        question.levelId = level._id.toString();
      }

      // background (array)
      if (Array.isArray(topic.backgroundId)) {
        const bgNames: string[] = [];
        const bgIds: string[] = [];

        for (const bg of topic.backgroundId) {
          if (typeof bg === "object") {
            const background = bg as unknown as IPopulatedData;
            bgNames.push(background.name);
            bgIds.push(background._id.toString());
          }
        }

        question.background = bgNames;
        question.backgroundId = bgIds;
      }

      // subject
      if (topic.subjectId && typeof topic.subjectId === "object") {
        const subject = topic.subjectId as unknown as IPopulatedData;
        question.subject = subject.name;
        question.subjectId = subject._id.toString();
      }

      // chapter
      if (topic.chapterId && typeof topic.chapterId === "object") {
        const chapter = topic.chapterId as unknown as IPopulatedData;
        question.chapter = chapter.name;
        question.chapterId = chapter._id.toString();
      }

      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Topic updated successfully and questions synced.",
      data: topic,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Delete Topic
export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Topic.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Topic not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully.",
      data: deleted,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};
