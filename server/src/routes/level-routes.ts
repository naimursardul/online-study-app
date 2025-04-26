import { Router } from "express";
import {
  createLevel,
  getAllLevels,
  getSingleLevel,
  updateLevel,
  deleteLevel,
} from "../controllers/level-controller";

const router = Router();

// CREATE a new level
router.post("/create", createLevel);

// READ all levels
router.get("/", getAllLevels);

// READ a single level by name
router.get("/:id", getSingleLevel);

// UPDATE a level by name
router.put("/:id", updateLevel);

// DELETE a level by name
router.delete("/:id", deleteLevel);

export default router;
