import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getEnv } from "@/config/env";
import { categorias, prioridades } from "@municipal/db-mesa-ayuda";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Base path to the transversal drizzle migration folder.
 * In monorepo: packages/seeders/drizzle/transversal/
 */
const TRANSVERSAL_MIGRATIONS_DIR = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../../../packages/seeders/drizzle/transversal",
);

// ─── Naming helpers ───────────────────────────────────────────────────────────

/**
 * Generates a safe core DB name from a tenant slug.
 * Convention: muni_<slug> with non-alphanumeric replaced by underscores.
 */
export function generateDbName(slug: string): string {
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `muni_${sanitized}`;
}

/**
 * Generates the transversal DB name for a tenant.
 * Convention: transversal_<slug> with non-alphanumeric replaced by underscores.
 */
export function generateTransversalDbName(slug: string): string {
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `transversal_${sanitized}`;
}

// ─── DB name validation ───────────────────────────────────────────────────────

function assertValidDbName(dbName: string): void {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(dbName)) {
    throw new Error(`Nombre de base de datos inválido: "${dbName}"`);
  }
}

// ─── Core tenant DB ───────────────────────────────────────────────────────────

/**
 * Creates a new PostgreSQL database for the tenant's core data (identidad, contabilidad).
 * Connects to the "postgres" maintenance DB to issue CREATE DATABASE.
 */
export async function createTenantDatabase(dbName: string): Promise<void> {
  assertValidDbName(dbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: "postgres",
    max: 1,
  });

  try {
    const exists = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (exists.rowCount && exists.rowCount > 0) {
      throw new Error(`La base de datos "${dbName}" ya existe`);
    }

    await pool.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await pool.end();
  }
}

/**
 * Runs all tenant migration SQL files against the newly created core database.
 * Reads each .sql file, splits by statement-breakpoint, executes in order,
 * and records in the drizzle migrations journal table.
 */
export async function runTenantMigrations(dbName: string): Promise<void> {
  const migrationsDir = resolve(
    import.meta.dirname ?? __dirname,
    "../../../../../../packages/seeders/drizzle",
  );

  const env = getEnv();
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: dbName,
    max: 1,
  });

  try {
    const journalPath = resolve(migrationsDir, "meta", "_journal.json");
    const journal = JSON.parse(await readFile(journalPath, "utf-8")) as {
      entries: Array<{ idx: number; tag: string; when: number }>;
    };

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations__" (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);

    for (const entry of journal.entries) {
      const sqlPath = resolve(migrationsDir, `${entry.tag}.sql`);
      const migrationSql = await readFile(sqlPath, "utf-8");

      const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const statement of statements) {
          await client.query(statement);
        }

        await client.query(
          `INSERT INTO "__drizzle_migrations__" (hash, created_at) VALUES ($1, $2)`,
          [entry.tag, entry.when],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

// ─── Transversal tenant DB ────────────────────────────────────────────────────

/**
 * Creates the transversal PostgreSQL database for a tenant's mensajeria schema.
 * Connects to the "postgres" maintenance DB to issue CREATE DATABASE.
 */
export async function createTransversalDatabase(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.TRANSVERSAL_DB_HOST,
    port: env.TRANSVERSAL_DB_PORT,
    user: env.TRANSVERSAL_DB_USER,
    password: env.TRANSVERSAL_DB_PASSWORD,
    database: "postgres",
    max: 1,
  });

  try {
    const exists = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [transversalDbName],
    );

    if (exists.rowCount && exists.rowCount > 0) {
      throw new Error(
        `La base de datos transversal "${transversalDbName}" ya existe`,
      );
    }

    await pool.query(`CREATE DATABASE "${transversalDbName}"`);
  } finally {
    await pool.end();
  }
}

/**
 * Runs transversal migrations (mensajeria + mesa_ayuda schemas) against the new transversal DB.
 * Uses the journal at packages/seeders/drizzle/transversal/meta/_journal.json
 */
export async function runTransversalMigrations(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.TRANSVERSAL_DB_HOST,
    port: env.TRANSVERSAL_DB_PORT,
    user: env.TRANSVERSAL_DB_USER,
    password: env.TRANSVERSAL_DB_PASSWORD,
    database: transversalDbName,
    max: 1,
  });

  try {
    const journalPath = resolve(
      TRANSVERSAL_MIGRATIONS_DIR,
      "meta",
      "_journal.json",
    );
    const journal = JSON.parse(await readFile(journalPath, "utf-8")) as {
      entries: Array<{ idx: number; tag: string; when: number }>;
    };

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations__" (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);

    for (const entry of journal.entries) {
      const sqlPath = resolve(
        TRANSVERSAL_MIGRATIONS_DIR,
        `${entry.tag}.sql`,
      );
      const migrationSql = await readFile(sqlPath, "utf-8");

      const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const statement of statements) {
          await client.query(statement);
        }

        await client.query(
          `INSERT INTO "__drizzle_migrations__" (hash, created_at) VALUES ($1, $2)`,
          [entry.tag, entry.when],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

// ─── Catalogo seeders ─────────────────────────────────────────────────────────

interface CategoriaData {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

interface PrioridadData {
  codigo: string;
  nombre: string;
  color: string;
  nivel: number;
  slaHoras: number;
}

const CATEGORIAS_DEFAULT: CategoriaData[] = [
  { codigo: "infraestructura", nombre: "Infraestructura y Obras",  icono: "hard-hat",      color: "warning",   orden: 1 },
  { codigo: "tramites",        nombre: "Tramites y Documentos",    icono: "file-text",     color: "info",      orden: 2 },
  { codigo: "reclamos",        nombre: "Reclamos Ciudadanos",      icono: "alert-triangle", color: "error",    orden: 3 },
  { codigo: "consultas",       nombre: "Consultas Generales",      icono: "help-circle",   color: "primary",   orden: 4 },
  { codigo: "servicios",       nombre: "Servicios Municipales",    icono: "building-2",    color: "secondary", orden: 5 },
  { codigo: "medioambiente",   nombre: "Medio Ambiente y Aseo",   icono: "leaf",           color: "success",   orden: 6 },
  { codigo: "seguridad",       nombre: "Seguridad Ciudadana",      icono: "shield",        color: "error",     orden: 7 },
  { codigo: "social",          nombre: "Asistencia Social",        icono: "heart",         color: "secondary", orden: 8 },
];

const PRIORIDADES_DEFAULT: PrioridadData[] = [
  { codigo: "baja",    nombre: "Baja",    color: "#34D399", nivel: 1, slaHoras: 72 },
  { codigo: "media",   nombre: "Media",   color: "#60A5FA", nivel: 2, slaHoras: 48 },
  { codigo: "alta",    nombre: "Alta",    color: "#FBBF24", nivel: 3, slaHoras: 24 },
  { codigo: "critica", nombre: "Critica", color: "#F87171", nivel: 4, slaHoras: 8  },
];

/**
 * Seeds the default catalogs (categorias, prioridades) into the transversal DB.
 * Idempotent: uses onConflictDoNothing on unique fields.
 */
export async function seedTransversalCatalogs(
  transversalDbName: string,
): Promise<void> {
  assertValidDbName(transversalDbName);

  const env = getEnv();
  const pool = new Pool({
    host: env.TRANSVERSAL_DB_HOST,
    port: env.TRANSVERSAL_DB_PORT,
    user: env.TRANSVERSAL_DB_USER,
    password: env.TRANSVERSAL_DB_PASSWORD,
    database: transversalDbName,
    max: 1,
  });

  const db = drizzle(pool);

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(categorias)
        .values(
          CATEGORIAS_DEFAULT.map((c) => ({
            codigo: c.codigo,
            nombre: c.nombre,
            icono: c.icono,
            color: c.color,
            orden: c.orden,
            activo: true,
          })),
        )
        .onConflictDoNothing({ target: categorias.codigo });

      await tx
        .insert(prioridades)
        .values(
          PRIORIDADES_DEFAULT.map((p) => ({
            codigo: p.codigo,
            nombre: p.nombre,
            color: p.color,
            nivel: p.nivel,
            slaHoras: p.slaHoras,
          })),
        )
        .onConflictDoNothing({ target: prioridades.codigo });
    });
  } finally {
    await pool.end();
  }
}

// ─── Orquestador: provisionar DB transversal completa ────────────────────────

/**
 * Full provisioning of a tenant's transversal database:
 * 1. Create the database
 * 2. Run migrations (creates mensajeria + mesa_ayuda schemas and tables)
 * 3. Seed default catalogs (categorias, prioridades)
 */
export async function provisionTransversalDb(
  transversalDbName: string,
): Promise<void> {
  await createTransversalDatabase(transversalDbName);
  await runTransversalMigrations(transversalDbName);
  await seedTransversalCatalogs(transversalDbName);
}
