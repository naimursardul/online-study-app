import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import ConnectDB from "./db/db";
import QuestionRouter from "./routes/question-routes";
import LevelRouter from "./routes/level-routes";
import BackgroundRouter from "./routes/background-routes";
import SubjectRouter from "./routes/subject-routes";
import ChapterRouter from "./routes/chapter-routes";
import TopicRouter from "./routes/topic-routes";
import RecordRouter from "./routes/record-routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Global error handler (should be after routes)
app.use(errorHandler);

// INITIATE APP
app.listen(process.env.PORT, () => {
  ConnectDB();
  console.log(`[SERVER]: Server is running on port ${process.env.PORT}`);
});
