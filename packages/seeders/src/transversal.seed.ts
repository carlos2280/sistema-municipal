/**
 * Seed de datos iniciales para la DB transversal.
 *
 * Crea:
 * - Schemas mensajeria y mesa_ayuda (si no existen)
 * - Catalogos globales: categorias y prioridades de mesa_ayuda
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seedCategorias } from "./mod_mesa_ayuda/seedCategorias";
import { seedPrioridades } from "./mod_mesa_ayuda/seedPrioridades";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const {
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_HOST = "localhost",
  DB_PORT = "5434",
  DB_SSL = "false",
  TRANSVERSAL_DB_NAME = "transversal",
} = process.env;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${TRANSVERSAL_DB_NAME}${DB_SSL === "true" ? "?sslmode=require" : ""}`;

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function seed() {
  console.log("Seeding transversal DB...\n");

  // 1. Crear schemas si no existen (DDL fuera de transaccion — PG hace auto-commit)
  await pool.query("CREATE SCHEMA IF NOT EXISTS mensajeria");
  await pool.query("CREATE SCHEMA IF NOT EXISTS mesa_ayuda");
  console.log("  Schemas mensajeria y mesa_ayuda verificados");

  // 2. Catalogos de mesa_ayuda dentro de transaccion (rollback atomico si falla)
  await db.transaction(async (tx) => {
    await seedCategorias(tx);
    await seedPrioridades(tx);
  });

  console.log("\nSeed transversal completado exitosamente.");
}

seed()
  .catch((err) => {
    console.error("Error al ejecutar seed transversal:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
