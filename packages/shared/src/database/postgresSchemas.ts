import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres"; // 👈 Aquí importas el tipo correcto
import { loadEnv } from "../config/env";

const { DB_SCHEMA_CONTABILIDAD } = loadEnv();

export default async function up(db: NodePgDatabase) {
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(DB_SCHEMA_CONTABILIDAD)}`);
}