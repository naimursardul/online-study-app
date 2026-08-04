import rateLimit, { ipKeyGenerator, Options } from "express-rate-limit";
import { Request, RequestHandler, Response, NextFunction } from "express";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function createStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });
}

// IPv6 must go through ipKeyGenerator so a single /64 can't be rotated for free.
function ipKey(req: Request) {
  return req.ip ? ipKeyGenerator(req.ip) : "unknown";
}

// Keying auth attempts by phone instead of IP: this app's users are largely on
// BD mobile carriers, where a whole CGNAT pool shares one IP.
function phoneKey(req: Request) {
  const phone = String(req.body?.phone ?? "").trim();
  return phone || ipKey(req);
}

// 429 body matching the app's standard error shape (see errorHandler.ts)
const handler = (
  _req: Request,
  res: Response,
  _next: NextFunction,
  options: Options,
) => {
  res.status(options.statusCode).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

const common = {
  windowMs: WINDOW_MS,
  standardHeaders: "draft-7" as const, // RateLimit / RateLimit-Policy headers
  legacyHeaders: false, // no X-RateLimit-* headers
  handler,
};

// Fail-closed limiters reject on a store outage. Translate the raw store error
// into a 503 so the Redis error message never reaches the client.
function failClosed(limiter: RequestHandler): RequestHandler {
  return (req, res, next) => {
    limiter(req, res, (err?: unknown) => {
      if (!err) return next();
      console.error("Rate limiter store unavailable:", err);
      res.status(503).json({
        success: false,
        message: "Service temporarily unavailable. Please try again shortly.",
      });
    });
  };
}

// All routes. Fails open: a Redis outage must not take the whole app down.
export const generalLimiter = rateLimit({
  ...common,
  store: createStore("general:"),
  limit: 300,
  passOnStoreError: true,
});

// Auth limiters fail CLOSED — a Redis outage must not become an open door for
// credential brute-forcing.

// Backstop across every auth route, so one IP can't spread attempts over many
// phone numbers to dodge the per-phone limits below.
export const authIpLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("authip:"),
    keyGenerator: ipKey,
    limit: 30,
    passOnStoreError: false,
  }),
);

// Successful sends are NOT skipped: each one writes a User row, so counting
// only failures would leave row creation unbounded.
export const sendOtpLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("otp:"),
    keyGenerator: phoneKey,
    limit: 3,
    passOnStoreError: false,
  }),
);

export const verifyOtpLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("verify:"),
    keyGenerator: phoneKey,
    limit: 6,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);

export const loginLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("login:"),
    keyGenerator: phoneKey,
    limit: 8,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);

export const createUserLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("signup:"),
    keyGenerator: ipKey,
    limit: 10,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);

// POST /img-upload/enhance triggers a paid kie.ai call per request. Keyed by
// user id, so it must be mounted after requireAuth.
export const enhanceLimiter = rateLimit({
  ...common,
  store: createStore("enhance:"),
  keyGenerator: (req: Request) => String(req.user!._id),
  limit: 40,
  passOnStoreError: true,
});
