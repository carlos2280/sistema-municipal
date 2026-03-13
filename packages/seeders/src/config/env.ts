import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_SSL: z.string().transform((val) => val === "true").default("false"),
  DB_POOL_MIN: z.coerce.number().int().positive().default(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

let env: EnvConfig;

export function loadEnv(): EnvConfig {
  const packageRoot = __dirname.includes("/src/")
    ? path.resolve(__dirname, "../..")
    : path.resolve(__dirname, "../..");

  dotenv.config({ path: path.join(packageRoot, ".env") });

  // Fallback: .env.infra en la raíz del monorepo
  const monorepoRoot = path.resolve(packageRoot, "../..");
  dotenv.config({ path: path.join(monorepoRoot, ".env.infra") });

  env = envSchema.parse(process.env);
  return env;
}

export function getEnv(): EnvConfig {
  if (!env) {
    throw new Error("Environment variables not loaded. Call loadEnv() first.");
  }
  return env;
}
