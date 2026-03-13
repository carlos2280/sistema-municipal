import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as identidadSchema from "@municipal/db-identidad";
import * as contabilidadSchema from "@municipal/db-contabilidad";
import * as mensajeriaSchema from "@municipal/db-mensajeria";
import { loadEnv } from "./env";

const schema = {
  ...identidadSchema,
  ...contabilidadSchema,
  ...mensajeriaSchema,
};

export type DbClient = ReturnType<typeof createDbClient>;

const env = loadEnv();

let dbInstance: DbClient | null = null;

function createDbClient() {
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    max: env.DB_POOL_MAX,
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  const isDev = env.NODE_ENV === "development";
  return drizzle(pool, { schema, logger: isDev });
}

export function initializeDB(): DbClient {
  if (!dbInstance) {
    dbInstance = createDbClient();
  }
  return dbInstance;
}

export async function closeDB() {
  if (dbInstance) {
    await dbInstance.$client.end();
    dbInstance = null;
  }
}

export const db: DbClient = initializeDB();
