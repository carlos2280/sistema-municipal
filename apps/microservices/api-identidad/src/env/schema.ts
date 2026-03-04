// src/config/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  // Server config
  PORT: z.coerce.number().int().positive().default(3001),
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

  // MFA — clave de 32 bytes en hex (64 caracteres)
  // Generar con: openssl rand -hex 32
  // NUNCA usar el default en producción
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
