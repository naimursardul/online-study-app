import { Request, Response } from "express";
import Topic from "../models/topic-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Topic
export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, level, background, subject, chapter } = req.body;

    if (!name || !level || !background || !subject || !chapter) {
      res.status(400).json({
        success: false,
        message: "Name, level, background, subject, and chapter are required.",
        data: null,
      });
      return;
    }

    const existing = await Topic.findOne({ name, level, subject, chapter });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "Topic already exists with this level, subject, and chapter.",
        data: null,
      });
      return;
    }

    const newTopic = new Topic({ name, level, background, subject, chapter });
    await newTopic.save();

    res.status(201).json({
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
    const { level, background, subject, chapter } = req.query;
    const filter: any = {};
    if (level) filter.level = level;
    if (background)
      filter.background = Array.isArray(background)
        ? [...background]
        : [background];
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;

    const topics = await Topic.find(filter)
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name")
      .populate("chapter", "name");

    res.status(200).json({
      success: true,
      message: "Topics fetched successfully.",
      data: topics,
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

// Get Single Topic
export const getSingleTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const topic = await Topic.findById(id)
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name")
      .populate("chapter", "name");

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
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name")
      .populate("chapter", "name");

    if (!topic) {
      res.status(404).json({
        success: false,
        message: "Topic not found.",
        data: null,
      });
      return;
    }

    // Update related BaseQuestions
    const questions = await BaseQuestion.find({ topicId: id });
    for (const question of questions) {
      question.topic = topic.name;

      // level
      if (
        topic.level &&
        typeof topic.level === "object" &&
        "name" in topic.level &&
        "_id" in topic.level
      ) {
        const level = topic.level as IPopulatedData;
        question.level = level.name;
        question.levelId = level._id.toString();
      }

      // background - full replacement
      if (Array.isArray(topic.background)) {
        const bgNames: string[] = [];
        const bgIds: string[] = [];

        for (const bg of topic.background) {
          if (typeof bg === "object" && "name" in bg && "_id" in bg) {
            const background = bg as IPopulatedData;
            bgNames.push(background.name);
            bgIds.push(background._id.toString());
          }
        }

        question.background = bgNames;
        question.backgroundId = bgIds;
      }

      // subject
      if (
        topic.subject &&
        typeof topic.subject === "object" &&
        "name" in topic.subject &&
        "_id" in topic.subject
      ) {
        const subject = topic.subject as IPopulatedData;
        question.subject = subject.name;
        question.subjectId = subject._id.toString();
      }

      // chapter
      if (
        topic.chapter &&
        typeof topic.chapter === "object" &&
        "name" in topic.chapter &&
        "_id" in topic.chapter
      ) {
        const chapter = topic.chapter as IPopulatedData;
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
