import type { EnvConfig } from '@/env/schema'
import * as schema from '@municipal/db-mesa-ayuda'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

let dbInstance: ReturnType<typeof createDbClient> | null = null

export function createDbClient(config: EnvConfig) {
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`

  const pool = new Pool({
    connectionString,
    // Railway y otros PaaS usan certificados que requieren rejectUnauthorized: false
    ssl: config.DB_SSL
      ? { rejectUnauthorized: config.DB_SSL_REJECT_UNAUTHORIZED }
      : false,
    max: config.DB_POOL_MAX,
  })

  pool.on('error', (err) => {
    process.stderr.write(
      `[api-mesa-ayuda:db] Error inesperado en pool: ${err.message}\n`,
    )
    process.exit(-1)
  })

  return drizzle(pool, { schema, logger: config.NODE_ENV === 'development' })
}

export function initializeDB(config: EnvConfig) {
  if (!dbInstance) {
    dbInstance = createDbClient(config)
  }
  return dbInstance
}

export function getDB() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDB() first.')
  }
  return dbInstance
}

export type DbClient = ReturnType<typeof createDbClient>
