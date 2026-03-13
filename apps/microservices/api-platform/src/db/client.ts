import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { EnvConfig } from "@/env/schema";
import * as schema from "@municipal/shared/database/platform";

let dbInstance: ReturnType<typeof createDbClient> | null = null;

export function createDbClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    max: config.DB_POOL_MAX,
  });

  pool.on("error", (err) => {
    process.stderr.write(`[api-platform:db] Error inesperado en pool: ${err.message}\n`);
    process.exit(-1);
  });

  const isDev = config.NODE_ENV === "development";
  return drizzle(pool, { schema, logger: isDev });
}

export function initializeDB(config: EnvConfig) {
  if (!dbInstance) {
    dbInstance = createDbClient(config);
  }
  return dbInstance;
}

export function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDB() first.");
  }
  return dbInstance;
}

export type DbClient = ReturnType<typeof createDbClient>;
