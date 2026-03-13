import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import * as identidadSchema from "@municipal/db-identidad";
import * as contabilidadSchema from "@municipal/db-contabilidad";
import * as mensajeriaSchema from "@municipal/db-mensajeria";

const schema = {
  ...identidadSchema,
  ...contabilidadSchema,
  ...mensajeriaSchema,
};

type Schema = typeof schema;

export type DbClient = NodePgDatabase<Schema>;

export type DbTransaction = PgTransaction<NodePgQueryResultHKT, Schema>;

// Para funciones que pueden usar tx o db
export type DbExecutor = DbClient | DbTransaction;
