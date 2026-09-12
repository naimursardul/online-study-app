import express from "express";
import {
  createInstitution,
  getAllInstitutions,
  getSingleInstitution,
  updateInstitution,
  deleteInstitution,
} from "../controllers/institution-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  institutionCreateSchema,
  institutionListSchema,
  institutionUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create a new institution
router.post(
  "/create",
  ...adminOnly,
  validate(institutionCreateSchema),
  createInstitution,
);

// Get all institutions (with optional filters)
router.get("/", validate(institutionListSchema), getAllInstitutions);

// Get a single institution by ID
router.get("/:id", getSingleInstitution);

// Update an existing institution by ID
router.put(
  "/:id",
  ...adminOnly,
  validate(institutionUpdateSchema),
  updateInstitution,
);

// Delete an institution by ID, pulling its pairs out of every question that cited it
router.delete(
  "/:id",
  ...adminOnly,
  validate(objectIdParam),
  deleteInstitution,
);

export default router;
