import rateLimit, { ipKeyGenerator, Options } from "express-rate-limit";
import { Request, RequestHandler, Response, NextFunction } from "express";
import { RedisStore } from "rate-limit-redis";
import { redisClient, REDIS_COMMAND_TIMEOUT_MS } from "../config/redis";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function createStore(prefix: string) {
  return new RedisStore({
    prefix,
    // disableOfflineQueue only rejects once the socket is fully closed. While
    // it's merely slow or mid-reconnect a command would otherwise hang for as
    // long as the network takes (observed: 30s+ stalls on flapping DNS), which
    // stalls the request instead of letting the fail-open/closed path run.
    sendCommand: (...args: string[]) =>
      redisClient.sendCommand(args, { timeout: REDIS_COMMAND_TIMEOUT_MS }),
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

// Public contact form. Fails OPEN like generalLimiter — a Redis blip must not
// block a visitor's message. IP-keyed, tight enough to curb spam and protect
// Resend's free-tier quota.
export const contactLimiter = rateLimit({
  ...common,
  store: createStore("contact:"),
  keyGenerator: ipKey,
  limit: 5,
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

// Password reset, keyed by phone like the other OTP routes. Successful sends
// are counted (like sendOtp) so a phone can't be flooded with reset codes;
// verify/reset skip successes so a legitimate reset isn't punished.
export const forgotPasswordLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("forgotpw:"),

    keyGenerator: phoneKey,
    limit: 3,
    passOnStoreError: false,
  }),
);

export const verifyResetOtpLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("resetverify:"),
    keyGenerator: phoneKey,
    limit: 6,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);

export const resetPasswordLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("resetpw:"),
    keyGenerator: phoneKey,
    limit: 6,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);

// POST /img-upload/enhance triggers a paid kie.ai call per request. Keyed by
// user id, so it must be mounted after requireAuth. Fails CLOSED: a Redis
// outage must not become an open door to the paid API.
export const enhanceLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("enhance:"),
    keyGenerator: (req: Request) => String(req.user!._id),
    limit: 40,
    passOnStoreError: false,
  }),
);

// POST /img-upload/generate-upload-url mints presigned R2 PUT URLs into the
// questions bucket. Keyed by user id (after adminOnly), and fails CLOSED for
// the same reason: with no limit at all, a Redis outage would leave the
// bucket wide open to unlimited uploads.
export const uploadUrlLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("uploadurl:"),
    keyGenerator: (req: Request) => String(req.user!._id),
    limit: 60,
    passOnStoreError: false,
  }),
);

// POST /extraction/extract-questions buffers up to 4×20MB in memory and makes
// a billable Gemini call with a 300s timeout. Single-digit per user: an admin
// hammering the button must not stack a dozen concurrent extractions.
export const extractionLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("extraction:"),
    keyGenerator: (req: Request) => String(req.user!._id),
    limit: 8,
    passOnStoreError: false,
  }),
);

// Exam writes. generate runs a $sample aggregation per attempt; create-answer
// grades the submission and writes an Answer + analytics update. Both are
// user-keyed (after requireAuth) and generous enough for real use — the point
// is a bound, not a squeeze.
export const examGenerateLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("examgen:"),
    keyGenerator: (req: Request) => String(req.user!._id),
    limit: 20,
    passOnStoreError: false,
  }),
);

export const examSubmitLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("examsub:"),
    keyGenerator: (req: Request) => String(req.user!._id),
    limit: 30,
    skipSuccessfulRequests: true,
    passOnStoreError: false,
  }),
);
