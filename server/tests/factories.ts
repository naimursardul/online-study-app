import bcryptjs from "bcryptjs";

/**
 * Fixtures. Everything is created through the real models so schema defaults
 * (role: "user", isVerified: false) apply exactly as in production.
 */

export const TEST_PASSWORD = "correct-horse-battery";

export async function createUser(
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; phone: string }> {
  const User = (await import("../src/models/user-model")).default;
  const phone =
    (overrides.phone as string) ??
    `017${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

  const user = await User.create({
    name: "Existing User",
    email: "existing@example.invalid",
    phone,
    password: await bcryptjs.hash(TEST_PASSWORD, 10),
    isVerified: true,
    ...overrides,
  });

  return { id: String(user._id), phone: user.phone as string };
}

export async function createTaxonomy(): Promise<{
  levelId: string;
  backgroundId: string;
}> {
  const Level = (await import("../src/models/level-model")).default;
  const Background = (await import("../src/models/background-model")).default;

  const level = await Level.create({ name: "HSC" });
  const background = await Background.create({
    name: "Science",
    levelId: level._id,
  });

  return { levelId: String(level._id), backgroundId: String(background._id) };
}

export async function createCollection(userId: string, name: string) {
  const Collection = (await import("../src/models/collection-model")).default;
  const doc = await Collection.create({ userId, name });
  return String(doc._id);
}

/** A real, signed session cookie for `userId`, minted the way login does. */
export async function sessionCookie(userId: string): Promise<string> {
  const User = (await import("../src/models/user-model")).default;
  const { createJWT } = await import("../src/utils/jwt-token");

  const user = await User.findById(userId).lean();
  if (!user) throw new Error("sessionCookie: user not found");

  return `token=${createJWT(user as never)}`;
}
