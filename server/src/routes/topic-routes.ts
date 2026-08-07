import express from "express";
import {
  createTopic,
  getAllTopics,
  getSingleTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topic-controller";
import { validate } from "../middlewares/validate";
import {
  topicListSchema,
  topicUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Create a new topic
router.post("/create", createTopic);

// Get all topics (with optional query filters)
router.get("/", validate(topicListSchema), getAllTopics);

// Get a single topic by ID
router.get("/:id", getSingleTopic);

// Update a topic and sync related BaseQuestions
router.put("/:id", validate(topicUpdateSchema), updateTopic);

// Delete a topic
router.delete("/:id", deleteTopic);

export default router;
