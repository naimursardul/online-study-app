import { createClient } from "redis";
import { redisUrl } from "./env";

export const redisClient = createClient({
  url: redisUrl,
  // Reject commands immediately while disconnected instead of buffering them.
  // Without this, rate-limit calls hang during a Redis outage rather than
  // erroring, so passOnStoreError never gets a chance to fail open.
  disableOfflineQueue: true,
  socket: {
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
