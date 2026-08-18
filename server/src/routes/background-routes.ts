import express from "express";
import {
  createBackground,
  getAllBackgrounds,
  getBackgroundImpact,
  getSingleBackground,
  updateBackground,
  deleteBackground,
} from "../controllers/background-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  backgroundListSchema,
  backgroundUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create Background
router.post("/create", ...adminOnly, createBackground);

// Get All Backgrounds (Optional query for levelId)
router.get("/", validate(backgroundListSchema), getAllBackgrounds);

// What deleting this background would remove. Before /:id so the literal wins.
router.get(
  "/:id/impact",
  ...adminOnly,
  validate(objectIdParam),
  getBackgroundImpact,
);

// Get Single Background by ID
router.get("/:id", getSingleBackground);

// Update Background by ID
router.put(
  "/:id",
  ...adminOnly,
  validate(backgroundUpdateSchema),
  updateBackground,
);

// Delete Background by ID
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteBackground);

export default router;
