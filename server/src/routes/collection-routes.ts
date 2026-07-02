import { Router } from "express";
import {
  getCollections,
  createCollection,
  renameCollection,
  toggleQuestionInCollection,
  deleteCollection,
} from "../controllers/collection-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = Router();

router.use(requireAuth);

router.get("/", getCollections);
router.post("/", createCollection);
router.patch("/:id", renameCollection);
router.patch("/:id/toggle-question", toggleQuestionInCollection);
router.delete("/:id", deleteCollection);

export default router;
