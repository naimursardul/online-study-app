import { describe, expect, it } from "vitest";
import request from "supertest";
import { getApp } from "./app";

/**
 * Proves the harness itself works: the guard passed, Redis and Mongo connected,
 * and src/app.ts was imported after both. If this file fails, nothing else in
 * the suite is meaningful.
 */
describe("test harness", () => {
  it("serves the unlimited health route", async () => {
    const app = await getApp();
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it("resolves env from .env.test, not .env", async () => {
    expect(new URL(process.env.MONGO_URI!).hostname).toBe("127.0.0.1");
    expect(new URL(process.env.DEV_REDIS_URL!).hostname).toBe("127.0.0.1");
  });
});
