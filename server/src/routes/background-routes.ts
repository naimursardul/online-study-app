import express from "express";
import {
  createBackground,
  getAllBackgrounds,
  getSingleBackground,
  updateBackground,
  deleteBackground,
} from "../controllers/background-controller";

const router = express.Router();

// Create Background
router.post("/create", createBackground);

// Get All Backgrounds (Optional query for levelId)
router.get("/", getAllBackgrounds);

// Get Single Background by ID
router.get("/:id", getSingleBackground);

// Update Background by ID
router.put("/:id", updateBackground);

// Delete Background by ID
router.delete("/:id", deleteBackground);

export default router;
