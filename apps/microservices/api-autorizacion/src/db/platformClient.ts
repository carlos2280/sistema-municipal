import type { EnvConfig } from "@/env/schema";
import * as platformSchema from "@municipal/shared/database/platform";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let platformDbInstance: ReturnType<typeof createPlatformClient> | null = null;

export function createPlatformClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.PLATFORM_DB_NAME}`;

  const pool = new Pool({
    connectionString,
    ssl: config.DB_SSL === true ? { rejectUnauthorized: false } : false,
    max: 3, // Pool pequeño — solo se usa para resolver tenant en login
  });

  pool.on("error", (err) => {
    console.error("[PlatformDB] Unexpected error on idle client", err);
  });

  return drizzle(pool, { schema: platformSchema });
}

export function initializePlatformDB(config: EnvConfig) {
  if (!platformDbInstance) {
    platformDbInstance = createPlatformClient(config);
    console.log(`[PlatformDB] Connected to database: ${config.PLATFORM_DB_NAME}`);
  }
  return platformDbInstance;
}

export function getPlatformDB() {
  if (!platformDbInstance) {
    throw new Error("Platform DB not initialized. Call initializePlatformDB() first.");
  }
  return platformDbInstance;
}

export type PlatformDbClient = ReturnType<typeof createPlatformClient>;
