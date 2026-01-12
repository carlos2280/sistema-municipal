import type { EnvConfig } from "@/env/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

let dbInstance: ReturnType<typeof createDbClient> | null = null;

export function createDbClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    max: config.DB_POOL_MAX,
  });

  // Manejo de errores del pool
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  return drizzle(pool, { schema, logger: true });
}

// Función para inicializar y obtener la instancia de DB
export function initializeDB(config: EnvConfig) {
  if (!dbInstance) {
    dbInstance = createDbClient(config);
  }
  return dbInstance;
}

// Función para obtener la instancia ya inicializada
export function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDB() first.");
  }
  return dbInstance;
}

export type DbClient = ReturnType<typeof createDbClient>;
