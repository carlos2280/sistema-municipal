import type { EnvConfig } from "@/env/schema";
import * as mesaAyudaSchema from "@municipal/db-mesa-ayuda";
import * as platformSchema from "@municipal/db-platform";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// ── Platform DB (modulos, municipalidades, suscripciones) ─────────────────────

let dbInstance: ReturnType<typeof createPlatformClient> | null = null;

function createPlatformClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    max: config.DB_POOL_MAX,
  });

  pool.on("error", (err) => {
    process.stderr.write(
      `[api-platform:db:platform] Error inesperado en pool: ${err.message}\n`,
    );
    process.exit(-1);
  });

  const isDev = config.NODE_ENV === "development";
  return drizzle(pool, { schema: platformSchema, logger: isDev });
}

export function initializeDB(config: EnvConfig) {
  if (!dbInstance) {
    dbInstance = createPlatformClient(config);
  }
  return dbInstance;
}

export function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDB() first.");
  }
  return dbInstance;
}

export type DbClient = ReturnType<typeof createPlatformClient>;

// ── Transversal DB (mesa_ayuda, mensajeria) ───────────────────────────────────

let transversalInstance: ReturnType<typeof createTransversalClient> | null =
  null;

function createTransversalClient(config: EnvConfig) {
  const connectionString = `postgres://${config.TRANSVERSAL_DB_USER}:${config.TRANSVERSAL_DB_PASSWORD}@${config.TRANSVERSAL_DB_HOST}:${config.TRANSVERSAL_DB_PORT}/${config.TRANSVERSAL_DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.TRANSVERSAL_DB_SSL ? { rejectUnauthorized: false } : false,
    max: 5,
  });

  pool.on("error", (err) => {
    process.stderr.write(
      `[api-platform:db:transversal] Error inesperado en pool: ${err.message}\n`,
    );
    process.exit(-1);
  });

  const isDev = config.NODE_ENV === "development";
  return drizzle(pool, { schema: mesaAyudaSchema, logger: isDev });
}

export function initializeTransversalDB(config: EnvConfig) {
  if (!transversalInstance) {
    transversalInstance = createTransversalClient(config);
  }
  return transversalInstance;
}

export function getTransversalDB() {
  if (!transversalInstance) {
    throw new Error(
      "Transversal DB not initialized. Call initializeTransversalDB() first.",
    );
  }
  return transversalInstance;
}

export type TransversalDbClient = ReturnType<typeof createTransversalClient>;
