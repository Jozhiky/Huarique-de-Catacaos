import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@huarique/domain": path.resolve(__dirname, "../../packages/domain/src"),
      "@huarique/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@huarique/config": path.resolve(__dirname, "../../packages/config"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
