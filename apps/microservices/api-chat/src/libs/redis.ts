import IoRedis from 'ioredis'
import { env } from '../config/env.js'
import { createLogger } from '@municipal/core/logger'

const logger = createLogger('api-chat:redis')

// ioredis con moduleResolution NodeNext: el default import es el namespace,
// pero .default es la clase Redis. Extraemos la clase correctamente.
const Redis = IoRedis.default ?? IoRedis

type RedisInstance = IoRedis.Redis

let redis: RedisInstance | null = null

export type { RedisInstance as RedisClient }

export function getRedisClient(): RedisInstance {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        return Math.min(times * 200, 5000)
      },
      lazyConnect: false,
    })

    redis.on('connect', () => {
      logger.info('[Redis] Conectado correctamente')
    })

    redis.on('error', (err: Error) => {
      logger.error(err, '[Redis] Error de conexión')
    })
  }

  return redis
}

/**
 * Crea un cliente Redis duplicado (necesario para pub/sub del adapter).
 * Cada llamada retorna una instancia nueva.
 */
export function createRedisClient(): RedisInstance {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      return Math.min(times * 200, 5000)
    },
    lazyConnect: false,
  })
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    logger.info('[Redis] Desconectado')
  }
}
