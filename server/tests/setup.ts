import { afterAll, beforeAll, beforeEach } from "vitest";
import { getApp, getRedis } from "./app";

beforeAll(async () => {
  await getApp();
});

beforeEach(async () => {
  // The auth limiters are fail-closed with low ceilings (authIpLimiter 30/IP,
  // sendOtpLimiter 3/phone), and rate-limit.ts has no `skip` hook. Flushing the
  // store between tests is the escape hatch, so no test-only branch has to be
  // added to production middleware — and the limiters still get exercised.
  // env-guard.ts is what makes this safe: it refuses any non-local Redis.
  const redis = await getRedis();
  await redis.flushDb();

  const mongoose = (await import("mongoose")).default;
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  const mongoose = (await import("mongoose")).default;
  // Guarded: when the boot in beforeAll failed (e.g. no local Redis), there is
  // no connection, and an unguarded dropDatabase() buffers for 10s and reports a
  // second, misleading error on top of the real one.
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  const { disconnectRedis } = await import("../src/config/redis");
  await disconnectRedis();
});
