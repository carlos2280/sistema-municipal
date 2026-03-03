import dotenv from "dotenv";
import { type EnvConfig, validateEnv } from "@/env/schema";

let env: EnvConfig;

export function loadEnv(): EnvConfig {
  dotenv.config();
  env = validateEnv(process.env);
  return env;
}

export function getEnv(): EnvConfig {
  if (!env) {
    throw new Error(
      "Environment variables not loaded. Call loadEnv() first.",
    );
  }
  return env;
}
