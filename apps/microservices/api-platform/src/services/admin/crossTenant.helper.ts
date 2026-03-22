/**
 * Helper para queries cross-tenant (Opción A del spec: iterar sobre DBs).
 *
 * Conecta a cada DB transversal de municipalidad y ejecuta una función de query,
 * combinando resultados en memoria. Uso exclusivo del admin panel.
 *
 * Restricciones:
 * - Solo usar para dashboards y reportes administrativos
 * - NO usar en rutas de usuario final (latencia lineal con número de tenants)
 * - El caller controla qué municipalidades se consultan (filtro por activas)
 */
import { getEnv } from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export interface TenantDbContext {
  tenantId: number;
  slug: string;
  nombre: string;
  transversalDbName: string;
}

export interface TenantQueryResult<T> {
  tenantId: number;
  slug: string;
  nombre: string;
  transversalDbName: string;
  data: T;
  error?: string;
}

type TransversalDrizzleDb = ReturnType<typeof drizzle>;

/**
 * Ejecuta una función de query contra la DB transversal de cada tenant.
 * Devuelve resultados individuales por tenant; si un tenant falla, su resultado
 * incluye el campo `error` con el mensaje y `data` como valor por defecto.
 *
 * @param tenants - Lista de contextos de tenant (id, slug, nombre, transversalDbName)
 * @param queryFn - Función que recibe un cliente drizzle y retorna datos
 * @param defaultValue - Valor por defecto para tenants que fallen
 */
export async function queryAllTenants<T>(
  tenants: TenantDbContext[],
  queryFn: (db: TransversalDrizzleDb, ctx: TenantDbContext) => Promise<T>,
  defaultValue: T,
): Promise<TenantQueryResult<T>[]> {
  const env = getEnv();

  const results = await Promise.allSettled(
    tenants.map(async (ctx) => {
      const pool = new Pool({
        host: env.TRANSVERSAL_DB_HOST,
        port: env.TRANSVERSAL_DB_PORT,
        user: env.TRANSVERSAL_DB_USER,
        password: env.TRANSVERSAL_DB_PASSWORD,
        database: ctx.transversalDbName,
        max: 2,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
      });

      try {
        const db = drizzle(pool);
        const data = await queryFn(db, ctx);
        return { ...ctx, data };
      } finally {
        await pool.end();
      }
    }),
  );

  return results.map((result, index) => {
    const ctx = tenants[index];

    if (result.status === "fulfilled") {
      return result.value as TenantQueryResult<T>;
    }

    return {
      tenantId: ctx.tenantId,
      slug: ctx.slug,
      nombre: ctx.nombre,
      transversalDbName: ctx.transversalDbName,
      data: defaultValue,
      error:
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
    };
  });
}

/**
 * Ejecuta una query cross-tenant y aplana los resultados en un solo array.
 * Útil para listar registros de todos los tenants en una sola respuesta.
 *
 * Los tenants que fallen retornan array vacío (el error se loggea via caller).
 */
export async function queryAllTenantsFlat<T>(
  tenants: TenantDbContext[],
  queryFn: (db: TransversalDrizzleDb, ctx: TenantDbContext) => Promise<T[]>,
): Promise<{ items: T[]; errors: Array<{ slug: string; error: string }> }> {
  const results = await queryAllTenants<T[]>(tenants, queryFn, []);

  const items: T[] = [];
  const errors: Array<{ slug: string; error: string }> = [];

  for (const result of results) {
    if (result.error) {
      errors.push({ slug: result.slug, error: result.error });
    } else {
      items.push(...result.data);
    }
  }

  return { items, errors };
}
