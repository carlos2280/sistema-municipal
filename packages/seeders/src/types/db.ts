import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

/**
 * DbExecutor acepta cualquier instancia Drizzle NodePg o transaccion,
 * independientemente del schema con el que fue creada.
 *
 * Usa `any` en los generics porque Drizzle ORM requiere que TFullSchema y
 * TSchema coincidan exactamente entre NodePgDatabase y PgTransaction.
 * Como los seeders se llaman desde contextos con schemas distintos
 * (tenantSchema, Record<string, never>, etc.), no existe un tipo generico
 * que unifique todos sin `any`. Es una limitacion conocida de Drizzle.
 *
 * @see https://github.com/drizzle-team/drizzle-orm/issues/1510
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbExecutor = NodePgDatabase<any> | PgTransaction<NodePgQueryResultHKT, any, any>;
