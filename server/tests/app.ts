import type { Express } from "express";
import {
  assertLocalTestServices,
  assertServicesReachable,
} from "./env-guard";

let cached: Express | undefined;

/**
 * Boots the real Express app for tests, replicating the ordering in
 * src/index.ts: Redis first, then Mongo, and only then import ../src/app.
 *
 * The order is load-bearing, not stylistic — middlewares/rate-limit.ts builds
 * its RedisStore at module scope from the connected client, so a top-level
 * `import app from "../src/app"` in a test file connects nothing and fails.
 * Everything under src/ is therefore imported dynamically, after the guard has
 * overridden process.env (config/env.ts parses it at import time).
 */
export async function getApp(): Promise<Express> {
  if (cached) return cached;

  assertLocalTestServices();
  await assertServicesReachable();

  const { connectRedis } = await import("../src/config/redis");
  await connectRedis();

  const mongoose = (await import("mongoose")).default;
  // Connecting directly rather than through src/db/db.ts: ConnectDB calls
  // process.exit(1) on failure, which kills the vitest worker with no diagnostic.
  await mongoose.connect(process.env.MONGO_URI!);

  cached = (await import("../src/app")).default;
  return cached;
}

export async function getRedis() {
  return (await import("../src/config/redis")).redisClient;
}
