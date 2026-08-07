import { Router } from "express";
import {
  createLevel,
  getAllLevels,
  getSingleLevel,
  updateLevel,
  deleteLevel,
} from "../controllers/level-controller";
import { validate } from "../middlewares/validate";
import {
  levelListSchema,
  levelUpdateSchema,
} from "../validations/crud.validation";

const router = Router();

// CREATE a new level
router.post("/create", createLevel);

// READ all levels
router.get("/", validate(levelListSchema), getAllLevels);

// READ a single level by name
router.get("/:id", getSingleLevel);

// UPDATE a level by name
router.put("/:id", validate(levelUpdateSchema), updateLevel);

// DELETE a level by name
router.delete("/:id", deleteLevel);

export default router;
