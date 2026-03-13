import { getTenantPool } from '@municipal/core/database'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { env } from '../config/env.js'
import * as schema from './schemas/index.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

// Instancia por defecto (backward compat)
export const db = drizzle(pool, { schema })

export type DbClient = typeof db

/**
 * Parsea la DATABASE_URL para extraer host, port, user, password.
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

const dbConfig = parseDatabaseUrl(env.DATABASE_URL)

/**
 * Crea una instancia de drizzle conectada a la DB de un tenant específico.
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
