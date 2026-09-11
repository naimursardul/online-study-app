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
import { validate } from "../middlewares/validate";
import {
  collectionIdParam,
  collectionQuestionsParam,
  createCollectionSchema,
  savedStatusParam,
  toggleSavedQuestionSchema,
} from "../validations/collection.validation";

const router = Router();

router.use(requireAuth);

router.get("/", getCollections);
router.post("/", validate(createCollectionSchema), createCollection);
router.patch(
  "/:id",
  validate(collectionIdParam),
  renameCollection,
);
router.delete("/:id", validate(collectionIdParam), deleteCollection);

router.post(
  "/saved-question/toggle",
  validate(toggleSavedQuestionSchema),
  toggleSavedQuestion,
);
router.get(
  "/saved-question/status/:questionId",
  validate(savedStatusParam),
  getSavedStatus,
);
router.get(
  "/:collectionId/questions",
  validate(collectionQuestionsParam),
  getQuestionsInCollection,
);

export default router;
