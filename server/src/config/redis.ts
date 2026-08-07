import { createClient } from "redis";
import { redisUrl } from "./env";

// node-redis only honours `timeout` as a per-command option, not a client
// default, so the rate-limit store passes this on every sendCommand.
export const REDIS_COMMAND_TIMEOUT_MS = 1000;

export const redisClient = createClient({
  url: redisUrl,
  // Reject commands immediately while disconnected instead of buffering them.
  // Without this, rate-limit calls hang during a Redis outage rather than
  // erroring, so passOnStoreError never gets a chance to fail open.
  disableOfflineQueue: true,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("ready", () => {
  console.log("[Redis]: ready");
});

redisClient.on("reconnecting", () => {
  console.warn("[Redis]: reconnecting...");
});

export async function connectRedis() {
  await redisClient.connect();
  console.log("✅ Redis connected");
}

export async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
