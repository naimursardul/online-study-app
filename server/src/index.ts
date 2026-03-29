import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import QuestionRouter from "./routes/question-routes";
import LevelRouter from "./routes/level-routes";
import BackgroundRouter from "./routes/background-routes";
import SubjectRouter from "./routes/subject-routes";
import ChapterRouter from "./routes/chapter-routes";
import TopicRouter from "./routes/topic-routes";
import RecordRouter from "./routes/record-routes";
import AuthRouter from "./routes/auth-routes";
import { errorHandler } from "./middlewares/errorHandler";
import ConnectDB from "./db/db";

dotenv.config();
const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : process.env.DEV_FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get("/", (req: Request, res: Response) => {
  res.json("Hello world!");
});

// ROUTES
app.use("/api/question", QuestionRouter);
app.use("/api/level", LevelRouter);
app.use("/api/background", BackgroundRouter);
app.use("/api/subject", SubjectRouter);
app.use("/api/chapter", ChapterRouter);
app.use("/api/topic", TopicRouter);
app.use("/api/record", RecordRouter);
app.use("/api/auth", AuthRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

console.log(process.env.JWT_SECRET);
// INITIATE APP
const startServer = async () => {
  try {
    await ConnectDB();

    app.listen(process.env.PORT, () => {
      console.log(`[SERVER]: Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
