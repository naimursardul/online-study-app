import { Router } from "express";
import {
  createLevel,
  getAllLevels,
  getLevelImpact,
  getSingleLevel,
  updateLevel,
  deleteLevel,
} from "../controllers/level-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  levelListSchema,
  levelUpdateSchema,
} from "../validations/crud.validation";

const router = Router();

// Reads stay public: the client's master-data cache and the public question bank
// fetch them without a session. Every write is admin-only — a level delete takes
// its whole tree with it.

// CREATE a new level
router.post("/create", ...adminOnly, createLevel);

// READ all levels
router.get("/", validate(levelListSchema), getAllLevels);

// READ what deleting this level would remove. Before /:id so the literal wins.
router.get("/:id/impact", ...adminOnly, validate(objectIdParam), getLevelImpact);

// READ a single level by name
router.get("/:id", getSingleLevel);

// UPDATE a level by name
router.put("/:id", ...adminOnly, validate(levelUpdateSchema), updateLevel);

// DELETE a level, its subtree, and the level on every profile pointing at it
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteLevel);

export default router;
