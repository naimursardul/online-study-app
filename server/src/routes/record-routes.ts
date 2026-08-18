// ===== routes/record-routes.ts =====
import express from "express";
import {
  createRecord,
  getAllRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord,
} from "../controllers/record-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  recordListSchema,
  recordUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create a new record
router.post("/create", ...adminOnly, createRecord);

// Get all records (with optional filters)
router.get("/", validate(recordListSchema), getAllRecord);

// Get a single record by ID
router.get("/:id", getSingleRecord);

// Update an existing record by ID
router.put("/:id", ...adminOnly, validate(recordUpdateSchema), updateRecord);

// Delete a record by ID, pulling it out of every question that cited it
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteRecord);

export default router;
