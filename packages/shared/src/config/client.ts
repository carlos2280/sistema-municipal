
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../"; // Asegúrate de tener tus esquemas importados
import type { EnvConfig } from "../env/schema";
import { loadEnv } from "./env";

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

// Añade esta nueva función para cerrar la conexión
export async function closeDB() {
  if (dbInstance) {
    await dbInstance.$client.end(); // Accedemos al pool a través de $client
    dbInstance = null;
  }
}

// Función para obtener la instancia ya inicializada
export function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDB() first.");
  }
  return dbInstance;
}

// Cargar y validar variables de entorno
const env = loadEnv();

// Inicializar la base de datos (esto crea la instancia)
export const db: DbClient = initializeDB(env);
export type DbClient = ReturnType<typeof createDbClient>;
