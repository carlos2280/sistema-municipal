import type { RedisClient as Redis } from '../libs/redis.js'

/**
 * Gestiona conexiones de sockets por usuario en Redis.
 *
 * Cada usuario puede tener múltiples sockets activos (múltiples pestañas,
 * dispositivos, reconexiones). El tracker mantiene un Set de socketIds por
 * usuario y solo marca offline cuando el último socket se desconecta.
 *
 * Claves Redis:
 *   conn:user:{userId}  → Set<socketId>
 */

const KEY_PREFIX = 'conn:user:'
const CONN_TTL = 86400 // 24h safety TTL

function userKey(userId: number): string {
  return `${KEY_PREFIX}${userId}`
}

export const connectionTracker = {
  /**
   * Registra un nuevo socket para el usuario.
   * Retorna la cantidad total de sockets activos del usuario.
   */
  async addSocket(redis: Redis, userId: number, socketId: string): Promise<number> {
    const key = userKey(userId)
    await redis.sadd(key, socketId)
    await redis.expire(key, CONN_TTL)
    return redis.scard(key)
  },

  /**
   * Elimina un socket del usuario.
   * Retorna la cantidad de sockets restantes (0 = usuario completamente desconectado).
   */
  async removeSocket(redis: Redis, userId: number, socketId: string): Promise<number> {
    const key = userKey(userId)
    await redis.srem(key, socketId)
    return redis.scard(key)
  },

  /**
   * Obtiene todos los socketIds activos de un usuario.
   */
  async getUserSockets(redis: Redis, userId: number): Promise<string[]> {
    return redis.smembers(userKey(userId))
  },

  /**
   * Verifica si el usuario tiene al menos un socket activo.
   */
  async isUserConnected(redis: Redis, userId: number): Promise<boolean> {
    const count = await redis.scard(userKey(userId))
    return count > 0
  },

  /**
   * Limpia todas las conexiones de un usuario (para uso administrativo).
   */
  async clearUser(redis: Redis, userId: number): Promise<void> {
    await redis.del(userKey(userId))
  },
}
