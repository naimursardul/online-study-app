import { Router } from "express";
import {
  getCollections,
  createCollection,
  renameCollection,
  deleteCollection,
} from "../controllers/collection-controller";
import {
  toggleSavedQuestion,
  getSavedStatus,
  getQuestionsInCollection,
} from "../controllers/saved-question-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = Router();

router.use(requireAuth);

router.get("/", getCollections);
router.post("/", createCollection);
router.patch("/:id", renameCollection);
router.delete("/:id", deleteCollection);

router.post("/saved-question/toggle", toggleSavedQuestion);
router.get("/saved-question/status/:questionId", getSavedStatus);
router.get("/:collectionId/questions", getQuestionsInCollection);

export default router;
