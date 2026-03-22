import { getTenantPool } from '@municipal/core/database'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { env } from '../config/env.js'
import * as schema from './schemas/index.js'

const { Pool } = pg

// Conexion principal: DB transversal (schema mensajeria)
const pool = new Pool({
  connectionString: env.DATABASE_URL_TRANSVERSAL,
  ssl: env.DATABASE_URL_TRANSVERSAL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
})

export const db = drizzle(pool, { schema })

export type DbClient = typeof db

/**
 * Parsea una DATABASE_URL para extraer host, port, user, password.
 * Se usa para crear pools de tenant con las mismas credenciales de servidor.
 */
function parseDatabaseUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: parsed.searchParams.get('sslmode') === 'require',
  }
}

const dbConfig = parseDatabaseUrl(env.DATABASE_URL_TRANSVERSAL)

/**
 * Crea una instancia de drizzle conectada a una DB de tenant específica.
 * El schema mensajeria vive en la DB transversal, pero el tenant puede
 * tener su propia instancia (mismas credenciales de servidor, distinta DB).
 * Reutiliza pools vía getTenantPool() del shared package.
 */
export function createTenantDbClient(dbName: string): DbClient {
  const tenantPool = getTenantPool(dbName, {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl,
  })
  return drizzle(tenantPool, { schema })
}
