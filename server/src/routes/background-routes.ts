import express from "express";
import {
  createBackground,
  getAllBackgrounds,
  getSingleBackground,
  updateBackground,
  deleteBackground,
} from "../controllers/background-controller";
import { validate } from "../middlewares/validate";
import {
  backgroundListSchema,
  backgroundUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Create Background
router.post("/create", createBackground);

// Get All Backgrounds (Optional query for levelId)
router.get("/", validate(backgroundListSchema), getAllBackgrounds);

// Get Single Background by ID
router.get("/:id", getSingleBackground);

// Update Background by ID
router.put("/:id", validate(backgroundUpdateSchema), updateBackground);

// Delete Background by ID
router.delete("/:id", deleteBackground);

export default router;
