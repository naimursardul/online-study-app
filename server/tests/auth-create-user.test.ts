import { describe, expect, it } from "vitest";
import request from "supertest";
import { getApp } from "./app";
import { createTaxonomy, createUser } from "./factories";

/**
 * A0.1 — POST /auth/create-user used to trust a body-supplied phone: POST any
 * registered number with a name, email, img and two ObjectIds and it returned
 * a valid 7-day session for that account, overwriting the profile on the way
 * in. create-user now requires the single-use signup grant cookie that
 * verify-otp issues, so identity comes from that grant, never from req.body.
 */

// The static OTP the server issues until an SMS provider is chosen.
const OTP = "123456";

const createBody = (phone: string, levelId: string, backgroundId: string) => ({
  phone,
  name: "Attacker Chosen Name",
  email: "attacker@example.invalid",
  img: "attacker-img",
  level: levelId,
  background: backgroundId,
});

describe("POST /auth/create-user", () => {
  it("refuses an already-registered phone without a signup grant", async () => {
    const app = await getApp();
    const victim = await createUser();
    const { levelId, backgroundId } = await createTaxonomy();

    const res = await request(app)
      .post("/auth/create-user")
      .send(createBody(victim.phone, levelId, backgroundId));

    // No grant → 401, no session minted, no profile write. (A Set-Cookie
    // header may still appear: rejectGrant clears the grant cookie itself.)
    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
    expect(mintedSession(res)).toBe(false);

    const User = (await import("../src/models/user-model")).default;
    const after = await User.findById(victim.id).lean();
    expect(after?.name).toBe("Existing User");
    expect(after?.email).toBe("existing@example.invalid");
  });

  it("refuses a grant whose phone does not match the body", async () => {
    const app = await getApp();
    const other = await createUser();
    const { levelId, backgroundId } = await createTaxonomy();

    // Complete a real signup for a fresh number to obtain a valid grant.
    const jar = await signupGrantFor(
      app,
      `018${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    );

    const res = await request(app)
      .post("/auth/create-user")
      .set("Cookie", jar.cookie)
      .send(createBody(other.phone, levelId, backgroundId));

    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
    expect(mintedSession(res)).toBe(false);

    // The cross-checked account is untouched; the grant holder is not half-created.
    const User = (await import("../src/models/user-model")).default;
    const otherAfter = await User.findById(other.id).lean();
    expect(otherAfter?.name).toBe("Existing User");
    const grantHolder = await User.findById(jar.userId).lean();
    expect(grantHolder?.name).toBeUndefined();
  });

  it("completes the real flow: send-otp → verify-otp → create-user returns 201", async () => {
    const app = await getApp();
    const { levelId, backgroundId } = await createTaxonomy();
    const phone = `019${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

    const sent = await request(app)
      .post("/auth/send-otp")
      .send({ phone, password: "signup-password" });
    expect(sent.status).toBe(200);

    const verified = await request(app)
      .post("/auth/verify-otp")
      .send({ phone, otp: OTP });
    expect(verified.status).toBe(200);

    const grantCookie = extractCookie(verified.headers["set-cookie"], "signup_grant");
    if (!grantCookie) throw new Error("verify-otp did not issue a signup grant");

    const res = await request(app)
      .post("/auth/create-user")
      .set("Cookie", grantCookie)
      .send({
        phone,
        name: "Real Signup",
        email: "real@example.invalid",
        img: "real-img",
        level: levelId,
        background: backgroundId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.phone).toBe(phone);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.signupGrantToken).toBeUndefined();
    // A session was minted alongside the profile.
    expect(mintedSession(res)).toBe(true);
  });

  it("rejects a replayed create-user with the same grant", async () => {
    const app = await getApp();
    const { levelId, backgroundId } = await createTaxonomy();
    const jar = await signupGrantFor(
      app,
      `016${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    );

    const first = await request(app)
      .post("/auth/create-user")
      .set("Cookie", jar.cookie)
      .send(createBody(jar.phone, levelId, backgroundId));
    expect(first.status).toBe(201);

    // Same cookie, second attempt: the grant is consumed, so this must fail
    // without minting a second session or overwriting the profile.
    const replay = await request(app)
      .post("/auth/create-user")
      .set("Cookie", jar.cookie)
      .send(createBody(jar.phone, levelId, backgroundId));

    expect([401, 403, 409]).toContain(replay.status);
    expect(replay.body.success).toBe(false);
    expect(mintedSession(replay)).toBe(false);
  });

  it("rejects verify-otp with a wrong OTP", async () => {
    const app = await getApp();
    const phone = `015${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

    await request(app).post("/auth/send-otp").send({
      phone,
      password: "signup-password",
    });

    const res = await request(app)
      .post("/auth/verify-otp")
      .send({ phone, otp: "000000" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

/** Runs send-otp + verify-otp for `phone` and returns the grant cookie + ids. */
async function signupGrantFor(app: Awaited<ReturnType<typeof getApp>>, phone: string) {
  await request(app).post("/auth/send-otp").send({
    phone,
    password: "signup-password",
  });
  const verified = await request(app)
    .post("/auth/verify-otp")
    .send({ phone, otp: OTP });

  const cookie = extractCookie(verified.headers["set-cookie"], "signup_grant");
  if (!cookie) throw new Error("verify-otp did not issue a signup grant");

  const User = (await import("../src/models/user-model")).default;
  const user = await User.findOne({ phone });
  if (!user) throw new Error("send-otp did not create the pending user");

  return { cookie, userId: String(user._id), phone };
}

function extractCookie(
  setCookies: string | string[] | undefined,
  name: string,
): string | undefined {
  const list = Array.isArray(setCookies)
    ? setCookies
    : setCookies
      ? [setCookies]
      : [];
  for (const raw of list) {
    const pair = raw.split(";");
    const [key, value] = pair[0].split("=");
    if (key === name) return `${key}=${value}`;
  }
  return undefined;
}

/**
 * True when the response set a `token=` cookie — i.e. minted a session.
 * Node types set-cookie as `string | string[] | undefined`; normalize here so
 * every assertion reads the same way.
 */
function mintedSession(res: request.Response): boolean {
  const raw: string | string[] | undefined = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.some((c) => c.startsWith("token="));
}
