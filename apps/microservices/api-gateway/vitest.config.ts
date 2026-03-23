import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		root: ".",
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		setupFiles: ["./src/__tests__/setup.ts"],
		env: {
			AUTH_URL: "http://localhost:4001",
			IDENTITY_URL: "http://localhost:4002",
			CONTABILIDAD_URL: "http://localhost:4003",
			CHAT_URL: "http://localhost:4004",
			PLATFORM_URL: "http://localhost:4060",
			MESA_AYUDA_URL: "http://localhost:4050",
			NODE_ENV: "test",
			JWT_SECRET: "test-jwt-secret-for-vitest",
			CORS_ORIGINS: "http://localhost:5030",
			ADMIN_API_KEY: "dev-admin-key-sistema-municipal-2024",
		},
	},
});
