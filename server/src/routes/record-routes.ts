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
import {
  recordListSchema,
  recordUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Create a new record
router.post("/create", createRecord);

// Get all records (with optional filters)
router.get("/", validate(recordListSchema), getAllRecord);

// Get a single record by ID
router.get("/:id", getSingleRecord);

// Update an existing record by ID
router.put("/:id", validate(recordUpdateSchema), updateRecord);

// Delete a record by ID
router.delete("/:id", deleteRecord);

export default router;
