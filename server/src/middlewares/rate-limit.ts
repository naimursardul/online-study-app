import rateLimit, { Options } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// 429 body matching the app's standard error shape (see errorHandler.ts)
const handler = (
  req: Request,
  res: Response,
  next: NextFunction,
  options: Options,
) => {
  res.status(options.statusCode).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

const common = {
  windowMs: WINDOW_MS,
  standardHeaders: true as const, // RateLimit-* headers
  legacyHeaders: false, // no X-RateLimit-* headers
  handler,
};

// All routes
export const generalLimiter = rateLimit({
  ...common,
  limit: 300,
});

// Shared budget across send-otp, verify-otp, create-user and
// login-with-phone: 5 FAILED attempts per IP per window. Successful
// requests (2xx) don't count, so failure responses must use 4xx codes.
export const authLimiter = rateLimit({
  ...common,
  limit: 5,
  skipSuccessfulRequests: true,
});

// POST /img-upload/enhance triggers a paid kie.ai call per request
export const enhanceLimiter = rateLimit({
  ...common,
  limit: 40,
});
