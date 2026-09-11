import dotenv from "dotenv";
import net from "node:net";

// Load .env.test with override, so a developer's real .env (which points at the
// Render key-value store and the Atlas cluster) can never leak into a test run.
dotenv.config({ path: ".env.test", override: true, quiet: true });

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function hostOf(label: string, url: string | undefined): string {
  if (!url) throw new Error(`[test-guard] ${label} is not set in .env.test`);
  try {
    return new URL(url).hostname.replace(/^\[|\]$/g, "");
  } catch {
    throw new Error(`[test-guard] ${label} is not a parseable URL`);
  }
}

// The suite calls redisClient.flushDb() between tests and drops Mongo
// collections in afterAll. Both are unrecoverable against a shared instance,
// and this project's DEV_REDIS_URL/MONGO_URI point at hosted services that the
// running app uses. So refuse outright unless both are on this machine.
// This is a hard gate, not a warning: there is no safe way to "mostly" flush.
export function assertLocalTestServices(): void {
  const redisHost = hostOf("DEV_REDIS_URL", process.env.DEV_REDIS_URL);
  const mongoHost = hostOf("MONGO_URI", process.env.MONGO_URI);

  for (const [label, host] of [
    ["DEV_REDIS_URL", redisHost],
    ["MONGO_URI", mongoHost],
  ] as const) {
    if (!LOOPBACK.has(host)) {
      throw new Error(
        `[test-guard] Refusing to run: ${label} points at "${host}", not localhost.\n` +
          `The suite flushes Redis and drops Mongo collections, which would destroy\n` +
          `data on a shared or hosted instance. Point .env.test at a local Redis and\n` +
          `a local MongoDB before running \`npm test\`.`,
      );
    }
  }

  // Mongoose takes the database from the URI path; an empty path means the
  // default db, which is exactly how a test run ends up in someone's real data.
  const dbName = new URL(process.env.MONGO_URI!).pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error(
      `[test-guard] MONGO_URI has no database name. Append a dedicated one, ` +
        `e.g. mongodb://127.0.0.1:27017/online-study-app-test`,
    );
  }
  if (!/test/i.test(dbName)) {
    throw new Error(
      `[test-guard] Refusing to run: Mongo database "${dbName}" does not contain ` +
        `"test". afterAll drops every collection in it.`,
    );
  }

  // env.ts requires DEV_REDIS_URL only when NODE_ENV === "development", and
  // demands the production REDIS_URL otherwise. Running as development is what
  // keeps the suite off the production store without changing production code.
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      `[test-guard] NODE_ENV must be "development" so config/env.ts resolves ` +
        `DEV_REDIS_URL rather than REDIS_URL. Got "${process.env.NODE_ENV}".`,
    );
  }
}

function canConnect(host: string, port: number, timeoutMs = 1500) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    const done = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

/**
 * Fails fast with an actionable message when a service isn't running.
 * Without this, a missing Redis surfaces as a 60s `beforeAll` hook timeout,
 * because node-redis retries the connection rather than rejecting.
 */
export async function assertServicesReachable(): Promise<void> {
  const targets = [
    ["Redis", process.env.DEV_REDIS_URL!, 6379],
    ["MongoDB", process.env.MONGO_URI!, 27017],
  ] as const;

  const down: string[] = [];
  for (const [label, url, defaultPort] of targets) {
    const parsed = new URL(url);
    const port = Number(parsed.port) || defaultPort;
    const host = parsed.hostname.replace(/^\[|\]$/g, "");
    if (!(await canConnect(host, port))) down.push(`${label} (${host}:${port})`);
  }

  if (down.length) {
    throw new Error(
      `[test-guard] Not reachable: ${down.join(", ")}.\n` +
        `The suite needs a local Redis and a local MongoDB. rate-limit.ts builds\n` +
        `its RedisStore at module scope and the auth limiters are fail-closed, so\n` +
        `without Redis every authenticated request answers 503 rather than being\n` +
        `rate-limited. Start them (e.g. \`docker run -p 6379:6379 redis:7-alpine\`,\n` +
        `or Memurai on Windows) and re-run \`npm test\`.`,
    );
  }
}
