import express, { Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import QuestionRouter from "./routes/question-routes";
import LevelRouter from "./routes/level-routes";
import BackgroundRouter from "./routes/background-routes";
import SubjectRouter from "./routes/subject-routes";
import ChapterRouter from "./routes/chapter-routes";
import TopicRouter from "./routes/topic-routes";
import RecordRouter from "./routes/record-routes";
import CollectionRouter from "./routes/collection-routes";
import AuthRouter from "./routes/auth-routes";
import MasterDataRouter from "./routes/master-question-data-routes";
import ExamRouter from "./routes/exam-routes";
import AnalyticsRouter from "./routes/analytics-routes";
import ExtractionRouter from "./routes/extraction-routes";
import ImgUploadRoutes from "./routes/imageUpload.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { generalLimiter } from "./middlewares/rate-limit";
import { sanitizeRequest } from "./middlewares/sanitize";
import { httpsRedirect } from "./middlewares/https-redirect";

dotenv.config();
const app = express();

// Render sits exactly one proxy hop in front; needed so req.ip (and
// rate limiting) sees the real client IP, not Render's proxy.
app.set("trust proxy", 1);

// Before everything else, so nothing is served over plain http in production.
app.use(httpsRedirect);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// After the body parsers (needs a parsed body) and before the limiters, so
// their keyGenerators read sanitized values.
app.use(sanitizeRequest);

app.get("/", (req: Request, res: Response) => {
  res.json("Hello world! bro");
});

// Rate limit everything below (health route above stays unlimited)
app.use(generalLimiter);

// ROUTES
app.use("/master-data", MasterDataRouter);
app.use("/question", QuestionRouter);
app.use("/level", LevelRouter);
app.use("/background", BackgroundRouter);
app.use("/subject", SubjectRouter);
app.use("/chapter", ChapterRouter);
app.use("/topic", TopicRouter);
app.use("/record", RecordRouter);
app.use("/collection", CollectionRouter);
app.use("/auth", AuthRouter);
app.use("/exam", ExamRouter);
app.use("/analytics", AnalyticsRouter);
app.use("/img-upload", ImgUploadRoutes);
app.use("/extraction", ExtractionRouter);

// Global error handler (should be after routes)
app.use(errorHandler);
export default app;
