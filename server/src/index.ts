import dotenv from "dotenv";
dotenv.config();

import type { Server } from "http";
import { connectRedis, disconnectRedis } from "./config/redis";
import ConnectDB from "./db/db";

async function bootstrap() {
  await connectRedis();
  await ConnectDB();

  // Import app only after connections are ready
  const { default: app } = await import("./app");

  const server: Server = app.listen(process.env.PORT, () => {
    console.log("Server started");
  });

  // Render sends SIGTERM on every deploy; drain in-flight requests first.
  const shutdown = async (signal: string) => {
    console.log(`[${signal}]: shutting down...`);
    server.close(async () => {
      await disconnectRedis();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
