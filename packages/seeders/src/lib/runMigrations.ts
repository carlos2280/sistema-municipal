/**
 * Runner de migraciones Drizzle reutilizable.
 *
 * Extrae la logica comun de migrate.ts y transversal.migrate.ts en una
 * funcion parametrizada para evitar duplicacion.
 *
 * Logica:
 * - Crea schemas opcionales si se pasan en config.schemas
 * - Compara journal.entries con public.__drizzle_migrations__
 * - Si una migracion falla por "objeto ya existe" (42P07, 42710, 42701),
 *   la marca como aplicada y continua
 * - Usa el mismo tracking table que drizzle-kit (public.__drizzle_migrations__)
 */
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const TRACKING_TABLE = "public.__drizzle_migrations__";

// Codigos PG que indican que el objeto ya existe (no son errores reales en re-run)
const ALREADY_EXISTS_CODES = new Set([
  "42P06", // schema already exists
  "42P07", // relation (table) already exists
  "42710", // object already exists (index, constraint, etc.)
  "42701", // column already exists
]);

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  entries: JournalEntry[];
}

interface PgError {
  code?: string;
  message?: string;
}

export interface MigrateConfig {
  /** Connection string completo (postgresql://...) */
  connectionString: string;
  /** Carpeta absoluta donde estan las migraciones y meta/_journal.json */
  migrationsFolder: string;
  /** Schemas a crear si no existen (ej: ['mensajeria', 'mesa_ayuda']) */
  schemas?: string[];
  /** Label para logs (ej: 'muni_default', 'platform', 'transversal') */
  label: string;
}

/**
 * Construye un connection string PostgreSQL a partir de variables de entorno.
 *
 * @param dbName - nombre de la base de datos
 * @param envVarName - nombre de la variable de entorno que contiene el nombre de la DB
 *                     (se usa como fallback: process.env[envVarName] ?? dbName)
 */
export function buildConnectionString(
  dbName: string,
  envVarName?: string,
): string {
  const {
    DB_USER = "postgres",
    DB_PASSWORD = "postgres",
    DB_HOST = "localhost",
    DB_PORT = "5432",
    DB_SSL,
  } = process.env;

  const effectiveDbName = envVarName
    ? (process.env[envVarName] ?? dbName)
    : dbName;

  const sslSuffix = DB_SSL === "true" ? "?sslmode=require" : "";

  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${effectiveDbName}${sslSuffix}`;
}

export async function runMigrations(config: MigrateConfig): Promise<void> {
  const { connectionString, migrationsFolder, schemas, label } = config;

  process.stdout.write(`\n--- Migraciones: ${label} ---\n`);

  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Crear schemas si se especificaron
    if (schemas && schemas.length > 0) {
      for (const schema of schemas) {
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      }
    }

    // 2. Crear tracking table si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    // 3. Leer journal
    const journalPath = path.join(migrationsFolder, "meta/_journal.json");
    const journal: Journal = JSON.parse(readFileSync(journalPath, "utf8"));

    // 4. Obtener la ultima migracion aplicada por timestamp
    const { rows } = await client.query<{ created_at: string }>(
      `SELECT created_at FROM ${TRACKING_TABLE} ORDER BY created_at DESC LIMIT 1`,
    );
    const lastApplied = rows.length > 0 ? Number(rows[0].created_at) : 0;

    // 5. Aplicar migraciones pendientes
    let pendingCount = 0;
    let appliedCount = 0;

    for (const entry of journal.entries) {
      if (entry.when <= lastApplied) {
        process.stdout.write(`  skip  ${entry.tag}\n`);
        continue;
      }

      pendingCount++;
      const sqlPath = path.join(migrationsFolder, `${entry.tag}.sql`);
      const sql = readFileSync(sqlPath, "utf8");
      const hash = crypto.createHash("sha256").update(sql).digest("hex");
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      process.stdout.write(
        `  apply  ${entry.tag} (${statements.length} statements)\n`,
      );

      // Ejecutar cada statement individualmente.
      // DDL (CREATE SCHEMA/TABLE) en PG hace auto-commit, asi que no se puede
      // envolver en una transaccion. Si un statement falla con "already exists"
      // se salta y se continua con el siguiente.
      let skippedCount = 0;
      let hadRealError = false;

      for (const stmt of statements) {
        try {
          await client.query(stmt);
        } catch (err: unknown) {
          const pgErr = err as PgError;
          if (ALREADY_EXISTS_CODES.has(pgErr.code ?? "")) {
            skippedCount++;
          } else {
            process.stderr.write(`  error  ${entry.tag}: ${pgErr.message}\n`);
            hadRealError = true;
            throw err;
          }
        }
      }

      if (!hadRealError) {
        await client.query(
          `INSERT INTO ${TRACKING_TABLE} (hash, created_at) VALUES ($1, $2)`,
          [hash, entry.when],
        );
        if (skippedCount > 0) {
          process.stdout.write(
            `  ok     ${entry.tag} (${skippedCount} objetos ya existian)\n`,
          );
        } else {
          process.stdout.write(`  ok     ${entry.tag}\n`);
        }
        appliedCount++;
      }
    }

    if (pendingCount === 0) {
      process.stdout.write("  No hay migraciones pendientes\n");
    } else {
      process.stdout.write(
        `\n${appliedCount}/${pendingCount} migracion(es) aplicada(s)\n`,
      );
    }
  } finally {
    client.release();
    await pool.end();
  }
}
