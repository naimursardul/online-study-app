/*
 * Title: Execution file
 * Description: App will be executed from here.
 * Author: Naimur Rahman
 * Date: 2024-10-26
 *
 */

import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./db/db.js";
import AuthRouter from "./routes/authRoutes.js";
import QuestionRouter from "./routes/questionRoutes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./passport/google-passport.config.js";
import "./passport/local-passport.config.js";
import "./passport/passport.config.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// SESSION CONFIG FOR PASSPORTJS
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/profile", (req, res) => {
  console.log("USER", req?.user);
  res.send(req?.user);
});

// ROUTES
app.use("/api/auth", AuthRouter);
app.use("/api/question", QuestionRouter);

// INITIATE APP
app.listen(process.env.PORT, () => {
  ConnectDB();
  console.log(`[SERVER]: Server is running on port ${process.env.PORT}`);
});
