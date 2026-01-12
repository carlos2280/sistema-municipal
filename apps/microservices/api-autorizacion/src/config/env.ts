import { type EnvConfig, validateEnv } from "@/env/schema";
// src/config/env.ts
import dotenv from "dotenv";

let env: EnvConfig;

export function loadEnv(): EnvConfig {
  // Cargar variables de entorno desde .env
  dotenv.config();

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
