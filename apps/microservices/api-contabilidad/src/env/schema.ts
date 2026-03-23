// src/config/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  // Server config
  PORT: z.coerce.number().int().positive().default(3002),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database config
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5434),
  DB_NAME: z.string().min(1).default("muni_default"),
  DB_SSL: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  // JWT config
  JWT_SECRET_TEMP: z.string().min(1).default("temp-secret-dev"),
  JWT_SECRET: z.string().min(1).default("dev-jwt-secret"),

  // Connection pool settings
  DB_POOL_MIN: z.coerce.number().int().positive().default(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // SSL — en producción rechazar certificados no confiables; en dev, permitir self-signed
  DB_SSL_REJECT_UNAUTHORIZED: z.coerce
    .boolean()
    .default(process.env.NODE_ENV === "production"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  return envSchema.parse(env);
}
