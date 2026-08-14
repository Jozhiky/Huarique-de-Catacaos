import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./apps/web/src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
    alias: {
      "@huarique/domain": path.resolve(__dirname, "./packages/domain/src"),
      "@huarique/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@huarique/config": path.resolve(__dirname, "./packages/config"),
    },
  },
});
