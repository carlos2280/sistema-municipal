import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    root: ".",
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@controllers": path.resolve(__dirname, "./src/controllers"),
      "@routes": path.resolve(__dirname, "./src/routes"),
    },
  },
});
