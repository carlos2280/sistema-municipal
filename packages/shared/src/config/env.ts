import { type EnvConfig, validateEnv } from "@municipalidad/shared/env/schema";
// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let env: EnvConfig;

export function loadEnv(): EnvConfig {
  // Determinar la raíz del paquete shared
  // En desarrollo (tsx): __dirname = .../packages/shared/src/config
  // En producción (dist): __dirname = .../packages/shared/dist/config
  const packageRoot = __dirname.includes("/src/")
    ? path.resolve(__dirname, "../..")
    : path.resolve(__dirname, "../..");

  // Cargar variables de entorno desde el .env local del paquete shared
  const envPath = path.join(packageRoot, ".env");
  dotenv.config({ path: envPath });

  // También cargar .env.infra de la raíz del monorepo como fallback
  const monorepoRoot = path.resolve(packageRoot, "../..");
  const infraPath = path.join(monorepoRoot, ".env.infra");
  dotenv.config({ path: infraPath });

  // Validar y cachear las variables
  env = validateEnv(process.env);
  return env;
}

export function getEnv(): EnvConfig {
  if (!env) {
    throw new Error("Environment variables not loaded. Call loadEnv() first.");
  }
  return env;
}
