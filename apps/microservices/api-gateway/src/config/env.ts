import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  AUTH_URL: z.string().url(),
  IDENTITY_URL: z.string().url(),
  CONTABILIDAD_URL: z.string().url(),
  CHAT_URL: z.string().url(),
  PLATFORM_URL: z.string().url(),
  NODE_ENV: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGINS: z.string().default("http://localhost:5030"),
  ADMIN_API_KEY: z.string().min(16).default("dev-admin-key-sistema-municipal-2024"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "[Config] ❌ Invalid environment variables",
    parsed.error.format(),
  );
  process.exit(1);
}

export const env = parsed.data;
