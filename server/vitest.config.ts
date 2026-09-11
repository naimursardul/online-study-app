import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests live outside src/ so tsconfig's "include": ["src/**/*"] never
    // compiles them into dist/ on `npm run build`.
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    // The app is a single shared Express instance over one Mongo connection and
    // one Redis client, and setup.ts flushes both between tests. Parallel files
    // would flush each other's fixtures mid-request.
    fileParallelism: false,
    // Cold Atlas/Redis connections plus bcrypt make the first test slow.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
