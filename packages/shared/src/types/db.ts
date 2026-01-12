import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres"; // esto es clave
import * as schema from "../database";

// este es correcto
export type DbClient = NodePgDatabase<typeof schema>;

// este también, usando los tres parámetros que espera PgTransaction
export type DbTransaction = PgTransaction<
    NodePgQueryResultHKT,
    typeof schema
// typeof schema
>;

// para funciones que pueden usar tx o db
export type DbExecutor = DbClient | DbTransaction;
