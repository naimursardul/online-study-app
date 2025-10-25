import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import ConnectDB from "./db/db";
import QuestionRouter from "./routes/question-routes";
import LevelRouter from "./routes/level-routes";
import BackgroundRouter from "./routes/background-routes";
import SubjectRouter from "./routes/subject-routes";
import ChapterRouter from "./routes/chapter-routes";
import TopicRouter from "./routes/topic-routes";
import RecordRouter from "./routes/record-routes";
import AuthRouter from "./routes/auth-routes";
import { errorHandler } from "./middlewares/errorHandler";
import "./passport/passport-config";
import "./passport/passport-credential-config";

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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "@#(bbcnxn", // Replace with a strong secret
    resave: false, // Avoid saving session if not modified
    saveUninitialized: false, // Avoid creating sessions until something is stored
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Reuse Mongoose connection
      collectionName: "sessions", // Optional
      ttl: 7 * 24 * 60 * 60, // Time-to-live in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Send over HTTPS in production
      httpOnly: true, // Protect cookie from being accessed by client-side scripts
      maxAge: 1000 * 60 * 60 * 24 * 7, // Expiry: 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust for cross-origin requirements if needed
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

// INITIATE APP
app.listen(process.env.PORT, () => {
  ConnectDB();
  console.log(`[SERVER]: Server is running on port ${process.env.PORT}`);
});
