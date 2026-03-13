/**
 * Runner de migraciones Drizzle robusto.
 *
 * Reemplaza `drizzle-kit migrate` para evitar fallos cuando el tracking table
 * se desincroniza (objetos ya existen en DB pero no están registrados).
 *
 * Lógica:
 * - Compara journal.entries con public.__drizzle_migrations__
 * - Si una migración falla por "objeto ya existe" (42P07, 42710), la marca como
 *   aplicada y continúa — no explota el proceso
 * - Usa el mismo tracking table que drizzle-kit (public.__drizzle_migrations__)
 */
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRIZZLE_FOLDER = path.resolve(__dirname, "../drizzle");
const TRACKING_TABLE = "public.__drizzle_migrations__";

config({ path: path.resolve(__dirname, "../.env") });

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
  breakpoints: boolean;
}
interface Journal {
  entries: JournalEntry[];
}

// Códigos PG que indican que el objeto ya existe (no son errores reales en re-run)
const ALREADY_EXISTS_CODES = new Set(["42P07", "42710", "42701"]);

async function main() {
  const pool = new pg.Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "muni_default",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    // 1. Crear tracking table si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    // 2. Leer journal
    const journal: Journal = JSON.parse(
      readFileSync(path.join(DRIZZLE_FOLDER, "meta/_journal.json"), "utf8"),
    );

    // 3. Obtener la última migración aplicada por timestamp
    const { rows } = await client.query<{ created_at: string }>(
      `SELECT created_at FROM ${TRACKING_TABLE} ORDER BY created_at DESC LIMIT 1`,
    );
    const lastApplied = rows.length > 0 ? Number(rows[0].created_at) : 0;

    // 4. Aplicar migraciones pendientes
    let pendingCount = 0;
    let appliedCount = 0;

    for (const entry of journal.entries) {
      if (entry.when <= lastApplied) {
        process.stdout.write(`  ✓ skip  ${entry.tag}\n`);
        continue;
      }

      pendingCount++;
      const sqlPath = path.join(DRIZZLE_FOLDER, `${entry.tag}.sql`);
      const sql = readFileSync(sqlPath, "utf8");
      const hash = crypto.createHash("sha256").update(sql).digest("hex");
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      process.stdout.write(
        `  ⟳ apply  ${entry.tag} (${statements.length} statements)\n`,
      );

      await client.query("BEGIN");
      try {
        for (const stmt of statements) {
          await client.query(stmt);
        }
        await client.query(
          `INSERT INTO ${TRACKING_TABLE} (hash, created_at) VALUES ($1, $2)`,
          [hash, entry.when],
        );
        await client.query("COMMIT");
        process.stdout.write(`  ✅ ok     ${entry.tag}\n`);
        appliedCount++;
      } catch (err: unknown) {
        await client.query("ROLLBACK");
        const pgErr = err as { code?: string; message?: string };

        if (ALREADY_EXISTS_CODES.has(pgErr.code ?? "")) {
          // Objeto ya existe: migración fue aplicada antes sin registrarse
          process.stdout.write(
            `  ⚠️  sync   ${entry.tag} — objetos ya existen, sincronizando tracking...\n`,
          );
          await client.query(
            `INSERT INTO ${TRACKING_TABLE} (hash, created_at) VALUES ($1, $2)`,
            [hash, entry.when],
          );
          appliedCount++;
        } else {
          process.stderr.write(`  ❌ error  ${entry.tag}: ${pgErr.message}\n`);
          throw err;
        }
      }
    }

    if (pendingCount === 0) {
      process.stdout.write("  ✓ No hay migraciones pendientes\n");
    } else {
      process.stdout.write(
        `\n✅ ${appliedCount}/${pendingCount} migracion(es) aplicada(s)\n`,
      );
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  process.stderr.write(`\n❌ Migración fallida: ${err.message}\n`);
  process.exit(1);
});
