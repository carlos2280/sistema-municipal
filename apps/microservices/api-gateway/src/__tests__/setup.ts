// Set required env vars for gateway tests before any module loads.
// This prevents env.ts from calling process.exit(1) when .env file is missing (CI).
// The vitest.config.ts `env` field also sets these, but this setup runs earlier
// to ensure process.env is populated before module-level dotenv.config() + Zod validation.
Object.assign(process.env, {
  AUTH_URL: process.env.AUTH_URL || "http://localhost:4001",
  IDENTITY_URL: process.env.IDENTITY_URL || "http://localhost:4002",
  CONTABILIDAD_URL: process.env.CONTABILIDAD_URL || "http://localhost:4003",
  CHAT_URL: process.env.CHAT_URL || "http://localhost:4004",
  PLATFORM_URL: process.env.PLATFORM_URL || "http://localhost:4060",
  MESA_AYUDA_URL: process.env.MESA_AYUDA_URL || "http://localhost:4050",
  NODE_ENV: "test",
  JWT_SECRET: process.env.JWT_SECRET || "test-jwt-secret-for-vitest",
  CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:5030",
  ADMIN_API_KEY:
    process.env.ADMIN_API_KEY || "dev-admin-key-sistema-municipal-2024",
});
