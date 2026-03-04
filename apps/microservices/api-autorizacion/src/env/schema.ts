// src/config/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  // Server config
  PORT: z.coerce.number().int().positive().default(3003),
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
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
  JWT_ISSUER: z.string().min(1).default("sistema-municipal"),
  JWT_SECRET_TEMP: z.string().min(1).default("temp-secret-dev"),

  // Platform DB (multi-tenant)
  PLATFORM_DB_NAME: z.string().min(1).default("platform"),

  // MFA — clave AES-256-GCM (debe coincidir con api-identidad en el mismo entorno)
  // Generar con: openssl rand -hex 32
  MFA_ENCRYPTION_KEY: z
    .string()
    .regex(
      /^[0-9a-fA-F]{64}$/,
      "MFA_ENCRYPTION_KEY debe ser exactamente 64 caracteres hexadecimales (32 bytes)",
    )
    .default("0".repeat(64)),

  // Connection pool settings
  DB_POOL_MIN: z.coerce.number().int().positive().default(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  return envSchema.parse(env);
}
