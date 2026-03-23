import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type EnvConfig, validateEnv } from "@/env/schema";
import dotenv from "dotenv";

let env: EnvConfig;

export function loadEnv(): EnvConfig {
  // Path explícito al .env de este microservicio — no depender del cwd
  // porque pnpm/concurrently pueden ejecutar desde la raíz del monorepo
  // y heredar DB_NAME de otro package (ej: seeders con DB_NAME=muni_default)
  const __dirname = dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: resolve(__dirname, "../../.env"), override: true });
  env = validateEnv(process.env);
  return env;
}

export function getEnv(): EnvConfig {
  if (!env) {
    throw new Error("Environment variables not loaded. Call loadEnv() first.");
  }
  return env;
}
