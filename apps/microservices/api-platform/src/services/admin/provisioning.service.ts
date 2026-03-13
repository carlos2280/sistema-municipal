import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";
import { getEnv } from "@/config/env";

/**
 * Base path to the seeders drizzle migration folder.
 * In monorepo: packages/seeders/drizzle/
 */
const MIGRATIONS_DIR = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../../../packages/seeders/drizzle",
);

/**
 * Generates a safe DB name from a tenant slug.
 * Convention: muni_<slug> with non-alphanumeric replaced by underscores.
 */
export function generateDbName(slug: string): string {
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `muni_${sanitized}`;
}

/**
 * Creates a new PostgreSQL database for a tenant.
 * Connects to the "postgres" maintenance DB to issue CREATE DATABASE.
 */
export async function createTenantDatabase(dbName: string): Promise<void> {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(dbName)) {
    throw new Error(`Invalid database name: ${dbName}`);
  }

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
      throw new Error(`Database "${dbName}" already exists`);
    }

    await pool.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await pool.end();
  }
}

/**
 * Runs all tenant migration SQL files against the newly created database.
 * Reads each .sql file, splits by statement-breakpoint, executes in order,
 * and records in the drizzle migrations journal table.
 */
export async function runTenantMigrations(dbName: string): Promise<void> {
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
    // Read migration journal
    const journalPath = resolve(MIGRATIONS_DIR, "meta", "_journal.json");
    const journal = JSON.parse(await readFile(journalPath, "utf-8")) as {
      entries: Array<{ idx: number; tag: string; when: number }>;
    };

    // Create the migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations__" (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);

    // Apply each migration in order
    for (const entry of journal.entries) {
      const sqlPath = resolve(MIGRATIONS_DIR, `${entry.tag}.sql`);
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

        // Record migration as applied
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
