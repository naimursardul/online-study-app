import express from "express";
import {
  createYear,
  getAllYears,
  getSingleYear,
  updateYear,
  deleteYear,
} from "../controllers/year-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  yearCreateSchema,
  yearListSchema,
  yearUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create a new year
router.post("/create", ...adminOnly, validate(yearCreateSchema), createYear);

// Get all years (with optional filters)
router.get("/", validate(yearListSchema), getAllYears);

// Get a single year by ID
router.get("/:id", getSingleYear);

// Update an existing year by ID
router.put("/:id", ...adminOnly, validate(yearUpdateSchema), updateYear);

// Delete a year by ID, pulling its pairs out of every question that cited it
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteYear);

export default router;
