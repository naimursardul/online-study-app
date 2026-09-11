import { describe, expect, it } from "vitest";
import request from "supertest";
import { getApp } from "./app";
import { createCollection, createUser, sessionCookie } from "./factories";

/**
 * A0.2 — GET /master-data used to initialise its Collection filter to {} and
 * only narrow it when a cookie was present, so an anonymous caller received
 * every user's collections, userId included. It also verified the JWT outside
 * its try/catch, so a stale cookie produced a 500 carrying "jwt expired".
 */
describe("GET /master-data", () => {
  it("returns no collections to an anonymous caller", async () => {
    const app = await getApp();
    const owner = await createUser();
    await createCollection(owner.id, "Owner's private collection");

    const res = await request(app).get("/master-data");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.collections).toEqual([]);
    // The taxonomy half is genuinely public and must still be served.
    expect(res.body.data).toHaveProperty("levels");
  });

  it("returns only the caller's own collections", async () => {
    const app = await getApp();
    const alice = await createUser();
    const bob = await createUser();
    await createCollection(alice.id, "Alice only");
    await createCollection(bob.id, "Bob only");

    const res = await request(app)
      .get("/master-data")
      .set("Cookie", await sessionCookie(alice.id));

    expect(res.status).toBe(200);
    const names = res.body.data.collections.map(
      (c: { name: string }) => c.name,
    );
    expect(names).toEqual(["Alice only"]);
  });

  it("treats a corrupted token as anonymous instead of throwing a 500", async () => {
    const app = await getApp();
    const owner = await createUser();
    await createCollection(owner.id, "Should stay hidden");

    const res = await request(app)
      .get("/master-data")
      .set("Cookie", "token=not.a.valid.jwt");

    expect(res.status).toBe(200);
    expect(res.body.data.collections).toEqual([]);
    expect(JSON.stringify(res.body)).not.toMatch(/jwt|expired|malformed/i);
  });

  it("ignores a token whose user no longer exists", async () => {
    const app = await getApp();
    const doomed = await createUser();
    const cookie = await sessionCookie(doomed.id);

    const User = (await import("../src/models/user-model")).default;
    await User.findByIdAndDelete(doomed.id);

    const res = await request(app).get("/master-data").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.collections).toEqual([]);
  });
});
