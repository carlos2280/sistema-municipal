import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3006),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Platform DB (central config)
  DB_USER: z.string().min(1).default("postgres"),
  DB_PASSWORD: z.string().min(1).default("postgres"),
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5434),
  DB_NAME: z.string().min(1).default("platform"),
  DB_SSL: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  // Platform config
  PLATFORM_DOMAIN: z.string().min(1).default("localhost"),

  // Admin API
  ADMIN_API_KEY: z.string().min(16).default("dev-admin-key-sistema-municipal-2024"),
  GATEWAY_INTERNAL_URL: z.string().url().default("http://localhost:3000"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(
  env: Record<string, string | undefined>,
): EnvConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}
