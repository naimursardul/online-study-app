import { describe, expect, it } from "vitest";
import request from "supertest";
import { getApp } from "./app";
import { createTaxonomy, createUser, sessionCookie } from "./factories";

/**
 * A2 — the status-code corrections. Failures used to return 200 with
 * success:false (33 sites), creations returned 200 instead of 201, and server
 * faults returned 400. Each row here pins one corrected path, and the
 * invariant below the table is the permanent gate on the whole class of bug.
 */

// The exact bug this work fixes, as a permanent gate: no 2xx response may
// carry success:false. Assert on every response the suite makes.
function expectNoFakeSuccess(res: request.Response) {
  expect(res.status < 300 && res.body?.success === false).toBe(false);
}

// Raw, well-formed-looking but broken JSON — forces express.json() to throw,
// which must surface as a clean 400, not a 500 with parse positions.
const BROKEN_JSON = '{"phone": "01700000000", ';

describe("status codes", () => {
  it("unknown routes return a JSON 404, not HTML", async () => {
    const app = await getApp();

    const res = await request(app).get("/definitely-not-a-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/route not found/i);
    expect(res.text).not.toMatch(/<html/i);
  });

  it("a junk ObjectId on /question/:id is a 400 with a clean message", async () => {
    const app = await getApp();

    const res = await request(app).get("/question/not-an-objectid");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid id.");
    // Never the Mongoose CastError text.
    expect(JSON.stringify(res.body)).not.toMatch(/Cast to ObjectId/i);
    expectNoFakeSuccess(res);
  });

  it("a well-formed but nonexistent question id is a 404", async () => {
    const app = await getApp();

    const res = await request(app).get(
      "/question/000000000000000000000000",
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("missing required query params on GET /question is a 400", async () => {
    const app = await getApp();

    const res = await request(app).get("/question");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expectNoFakeSuccess(res);
  });

  it("creating a taxonomy row without auth is a 401", async () => {
    const app = await getApp();

    const res = await request(app)
      .post("/level/create")
      .send({ name: "HSC", details: "Higher Secondary" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expectNoFakeSuccess(res);
  });

  it("admin taxonomy lifecycle: 201 create, 409 duplicate, 400 missing field", async () => {
    const app = await getApp();
    const admin = await createUser({ role: "admin" });
    const cookie = await sessionCookie(admin.id);
    const suffix = String(Math.floor(Math.random() * 1e9));

    // 201 on first create.
    const created = await request(app)
      .post("/background/create")
      .set("Cookie", cookie)
      .send({ name: `Science-${suffix}`, levelId: (await createTaxonomy()).levelId });
    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expectNoFakeSuccess(created);

    // 409 on the same (name, levelId) again.
    const dupLevelId = created.body.data.levelId;
    const duplicate = await request(app)
      .post("/background/create")
      .set("Cookie", cookie)
      .send({ name: `Science-${suffix}`, levelId: dupLevelId });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.success).toBe(false);
    expectNoFakeSuccess(duplicate);

    // 400 when a required field is missing.
    const missing = await request(app)
      .post("/background/create")
      .set("Cookie", cookie)
      .send({ levelId: dupLevelId });
    expect(missing.status).toBe(400);
    expect(missing.body.success).toBe(false);
    expectNoFakeSuccess(missing);
  });

  it("a nonexistent background id is a 404 for an admin", async () => {
    const app = await getApp();
    const admin = await createUser({ role: "admin" });
    const cookie = await sessionCookie(admin.id);

    const res = await request(app)
      .get("/background/000000000000000000000000")
      .set("Cookie", cookie);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expectNoFakeSuccess(res);
  });

  it("malformed JSON body is a 400 with a clean message", async () => {
    const app = await getApp();

    const res = await request(app)
      .post("/auth/send-otp")
      .set("Content-Type", "application/json")
      .send(BROKEN_JSON);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid json body/i);
    // Never the body-parser internals (position, snippet of the raw body).
    expect(JSON.stringify(res.body)).not.toMatch(/position|Unexpected token/i);
  });

  it("a plain user is 403 on admin routes, not 200", async () => {
    const app = await getApp();
    const pleb = await createUser();
    const cookie = await sessionCookie(pleb.id);

    const res = await request(app)
      .post("/level/create")
      .set("Cookie", cookie)
      .send({ name: "Sneaky", details: "Should not work" });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expectNoFakeSuccess(res);
  });
});
