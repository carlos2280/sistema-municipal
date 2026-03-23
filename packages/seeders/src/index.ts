import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { closeDB, db, tenantSchema } from "./config/client";
import { seedBase } from "./base/index";
import { seedDevelopment } from "./development/index";
import { seedAdminUser } from "./production/seedAdminUser";
import { seedOficinaBase } from "./base/identidad/seedOficinaBase";

export { seedBase } from "./base/index";
export { seedDevelopment } from "./development/index";
export { seedAdminUser } from "./production/seedAdminUser";
export { runMigrations, buildConnectionString } from "./lib/runMigrations";
export type { MigrateConfig } from "./lib/runMigrations";
export { seedCategorias } from "./base/transversal/seedCategorias";
export { seedPrioridades } from "./base/transversal/seedPrioridades";

// ---------------------------------------------------------------------------
// Helpers de conexion
// ---------------------------------------------------------------------------

function buildConnectionString(dbName: string): string {
  const {
    DB_USER = "postgres",
    DB_PASSWORD = "postgres",
    DB_HOST = "localhost",
    DB_PORT = "5434",
    DB_SSL = "false",
  } = process.env;

  const ssl = DB_SSL === "true" ? "?sslmode=require" : "";
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}${ssl}`;
}

// ---------------------------------------------------------------------------
// runAllSeeders — O4: parametrizado por dbName
// ---------------------------------------------------------------------------

/**
 * Ejecuta todos los seeders para el tenant conectado en el pool singleton.
 *
 * @param dbName - nombre de la DB (solo informativo — la conexion activa la define el env).
 *                 Permite llamar runAllSeeders("muni_demo") para logging claro en CI.
 * @param transversalDbName - nombre de la DB transversal a la que conectar.
 */
export async function runAllSeeders(
  dbName: string = process.env.DB_NAME ?? "muni_default",
  transversalDbName: string = process.env.TRANSVERSAL_DB_NAME ?? "transversal_muni_default",
): Promise<void> {
  const env = process.env.NODE_ENV ?? "development";

  process.stdout.write(`\nIniciando seeders para DB=${dbName} (env=${env})...\n`);

  const transversalPool = new Pool({ connectionString: buildConnectionString(transversalDbName) });
  const transversalDb: NodePgDatabase<Record<string, never>> = drizzle(transversalPool);

  try {
    await db.transaction(async (tx) => {
      // SIEMPRE: catalogos del sistema
      await seedBase(tx, transversalDb);

      // Solo en dev y staging
      if (env !== "production") {
        await seedDevelopment(tx);
      }
    });

    process.stdout.write("\nTodos los seeders ejecutados correctamente.\n");
  } catch (error) {
    process.stderr.write(`Error al ejecutar seeders: ${String(error)}\n`);
    throw error;
  } finally {
    await transversalPool.end();
  }
}

// ---------------------------------------------------------------------------
// seedNewTenant — para provisioning.service.ts
// ---------------------------------------------------------------------------

interface NewTenantConfig {
  adminEmail: string;
  adminNombre: string;
}

interface NewTenantResult {
  tempPassword: string;
}

/**
 * Seed completo para un nuevo tenant.
 * Ejecuta catalogos base + crea usuario admin con contrasena temporal.
 *
 * Uso tipico desde provisioning.service.ts tras crear la DB del tenant.
 *
 * @returns tempPassword - contrasena en texto plano (enviar por email, no persistir)
 */
export async function seedNewTenant(
  tenantDbName: string,
  transversalDbName: string,
  config: NewTenantConfig,
): Promise<NewTenantResult> {
  // Pools dedicados para este tenant (independientes del pool global)
  const tenantPool = new Pool({ connectionString: buildConnectionString(tenantDbName) });
  const transversalPool = new Pool({ connectionString: buildConnectionString(transversalDbName) });

  // Usar el mismo schema que DbClient para que DbExecutor/DbTransaction sean compatibles
  const tenantDb = drizzle(tenantPool, { schema: tenantSchema });
  const transversalDb: NodePgDatabase<Record<string, never>> = drizzle(transversalPool);

  try {
    // Generar contrasena temporal
    const tempPassword = crypto.randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await tenantDb.transaction(async (tx) => {
      await seedBase(tx, transversalDb);
      const idOficina = await seedOficinaBase(tx);
      await seedAdminUser(tx, { email: config.adminEmail, nombreCompleto: config.adminNombre, idOficina }, passwordHash);
    });

    process.stdout.write(`seedNewTenant: tenant ${tenantDbName} inicializado correctamente\n`);

    return { tempPassword };
  } finally {
    await tenantPool.end();
    await transversalPool.end();
  }
}

// ---------------------------------------------------------------------------
// Entry point CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Cargar .env relativo al package
  const __dirname = dirname(fileURLToPath(import.meta.url));
  loadDotenv({ path: resolve(__dirname, "../.env") });

  runAllSeeders()
    .catch((err: unknown) => {
      process.stderr.write(`Error fatal: ${String(err)}\n`);
      process.exit(1);
    })
    .finally(() => closeDB());
}
