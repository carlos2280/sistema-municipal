import type { EnvConfig } from "@/env/schema";
import { getTenantPool } from "@municipal/shared/database";
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
    process.stderr.write(`[api-identidad:db] Error inesperado en pool: ${err.message}\n`);
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

/**
 * Crea una instancia de drizzle conectada a la DB de un tenant específico.
 * Reutiliza pools vía getTenantPool() del shared package.
 */
export function createTenantDbClient(
  dbName: string,
  config: EnvConfig,
): DbClient {
  const pool = getTenantPool(dbName, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    ssl: config.DB_SSL,
    maxConnections: config.DB_POOL_MAX,
  });
  return drizzle(pool, { schema });
}
