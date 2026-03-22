import { createLogger } from '@municipal/core/logger'
import { env } from '../config/env.js'

const logger = createLogger('api-chat:platformClient')

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface MunicipalidadResponse {
  transversal_db_name: string
}

interface PlatformApiResponse {
  data: MunicipalidadResponse
}

// ─── Cache con TTL ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  dbName: string
  expiresAt: number
}

const tenantDbCache = new Map<number, CacheEntry>()

// ─── Error tipado ────────────────────────────────────────────────────────────

class PlatformClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'PlatformClientError'
  }
}

// ─── Resolución de DB transversal por tenantId ───────────────────────────────

/**
 * Resuelve el nombre de la DB transversal del tenant consultando api-platform.
 * Cachea el resultado por `tenantId` con TTL de 5 minutos.
 *
 * Si `PLATFORM_URL` no está configurada (entorno local sin platform),
 * devuelve `undefined` y el caller debe usar la DB por defecto.
 */
export async function resolveTransversalDbName(
  tenantId: number,
): Promise<string | undefined> {
  if (!env.PLATFORM_URL) {
    logger.debug(
      { tenantId },
      'PLATFORM_URL no configurada — usando DB transversal por defecto',
    )
    return undefined
  }

  const now = Date.now()
  const cached = tenantDbCache.get(tenantId)

  if (cached && cached.expiresAt > now) {
    logger.debug(
      { tenantId, dbName: cached.dbName },
      'DB transversal resuelta desde cache',
    )
    return cached.dbName
  }

  try {
    const res = await fetch(
      `${env.PLATFORM_URL}/api/v1/platform/municipalidades/${tenantId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      },
    )

    if (!res.ok) {
      logger.warn(
        { tenantId, status: res.status },
        'Platform respondio con error al resolver DB transversal',
      )
      return undefined
    }

    const body = (await res.json()) as PlatformApiResponse
    const dbName = body.data?.transversal_db_name

    if (!dbName) {
      logger.warn(
        { tenantId },
        'Platform no devolvio transversal_db_name para el tenant',
      )
      return undefined
    }

    tenantDbCache.set(tenantId, { dbName, expiresAt: now + CACHE_TTL_MS })

    logger.info(
      { tenantId, dbName },
      'DB transversal resuelta desde platform y cacheada',
    )

    return dbName
  } catch (err) {
    if (err instanceof PlatformClientError) throw err
    logger.error(
      { tenantId, err },
      'Error al consultar platform para resolver DB transversal',
    )
    return undefined
  }
}

/**
 * Invalida la entrada de cache para un tenant.
 * Llamar cuando se actualiza la configuración de la municipalidad.
 */
export function invalidateTenantDbCache(tenantId: number): void {
  tenantDbCache.delete(tenantId)
}
