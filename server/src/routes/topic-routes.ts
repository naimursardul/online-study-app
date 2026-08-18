import express from "express";
import {
  createTopic,
  getAllTopics,
  getSingleTopic,
  getTopicImpact,
  updateTopic,
  deleteTopic,
} from "../controllers/topic-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  topicListSchema,
  topicUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create a new topic
router.post("/create", ...adminOnly, createTopic);

// Get all topics (with optional query filters)
router.get("/", validate(topicListSchema), getAllTopics);

// What deleting this topic would remove. Before /:id so the literal wins.
router.get("/:id/impact", ...adminOnly, validate(objectIdParam), getTopicImpact);

// Get a single topic by ID
router.get("/:id", getSingleTopic);

// Update a topic and sync related BaseQuestions
router.put("/:id", ...adminOnly, validate(topicUpdateSchema), updateTopic);

// Delete a topic and the questions filed under it
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteTopic);

export default router;
