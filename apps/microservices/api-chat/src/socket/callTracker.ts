import type { RedisClient as Redis } from '../libs/redis.js'

/**
 * Gestiona participantes de llamadas activas en Redis.
 *
 * A diferencia del tracking anterior (in-memory Map<llamadaId, Set<userId>>),
 * este tracker:
 *   - Persiste en Redis (sobrevive restarts/deploys)
 *   - Trackea por socketId, no por userId (evita que un disconnect de otra
 *     pestaña mate la llamada)
 *   - Comparte estado entre instancias de api-chat
 *
 * Claves Redis:
 *   call:{llamadaId}:sockets    → Set<"userId:socketId">
 *
 * Formato de miembros: "userId:socketId" para poder agrupar por usuario.
 */

const KEY_PREFIX = 'call:'
const CALL_TTL = 7200 // 2h safety TTL

function callKey(llamadaId: number): string {
  return `${KEY_PREFIX}${llamadaId}:sockets`
}

function encodeMember(userId: number, socketId: string): string {
  return `${userId}:${socketId}`
}

function decodeMember(member: string): { userId: number; socketId: string } {
  const separatorIndex = member.indexOf(':')
  return {
    userId: Number(member.substring(0, separatorIndex)),
    socketId: member.substring(separatorIndex + 1),
  }
}

export const callTracker = {
  /**
   * Agrega un participante (socket) a una llamada.
   */
  async addParticipant(
    redis: Redis,
    llamadaId: number,
    userId: number,
    socketId: string
  ): Promise<void> {
    const key = callKey(llamadaId)
    await redis.sadd(key, encodeMember(userId, socketId))
    await redis.expire(key, CALL_TTL)
  },

  /**
   * Elimina un socket específico de una llamada.
   * Retorna info sobre el estado post-eliminación.
   */
  async removeSocket(
    redis: Redis,
    llamadaId: number,
    userId: number,
    socketId: string
  ): Promise<{ totalRemaining: number; userHasOtherSockets: boolean }> {
    const key = callKey(llamadaId)
    await redis.srem(key, encodeMember(userId, socketId))

    const remaining = await redis.smembers(key)
    const userHasOtherSockets = remaining.some((m) => {
      const { userId: memberId } = decodeMember(m)
      return memberId === userId
    })

    return {
      totalRemaining: remaining.length,
      userHasOtherSockets,
    }
  },

  /**
   * Obtiene todas las llamadas en las que participa un socket.
   * Necesario para el disconnect handler.
   */
  async getCallsForSocket(
    redis: Redis,
    userId: number,
    socketId: string
  ): Promise<number[]> {
    const member = encodeMember(userId, socketId)
    const llamadaIds: number[] = []

    // Escanear claves de llamadas activas
    let cursor = '0'
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${KEY_PREFIX}*:sockets`,
        'COUNT',
        100
      )
      cursor = nextCursor

      for (const key of keys) {
        const isMember = await redis.sismember(key, member)
        if (isMember) {
          // Extraer llamadaId del key: "call:{id}:sockets"
          const idStr = key.replace(KEY_PREFIX, '').replace(':sockets', '')
          llamadaIds.push(Number(idStr))
        }
      }
    } while (cursor !== '0')

    return llamadaIds
  },

  /**
   * Obtiene los userIds únicos en una llamada.
   */
  async getParticipantUserIds(redis: Redis, llamadaId: number): Promise<number[]> {
    const members = await redis.smembers(callKey(llamadaId))
    const userIds = new Set<number>()
    for (const m of members) {
      userIds.add(decodeMember(m).userId)
    }
    return Array.from(userIds)
  },

  /**
   * Obtiene el conteo total de sockets en una llamada.
   */
  async getParticipantCount(redis: Redis, llamadaId: number): Promise<number> {
    return redis.scard(callKey(llamadaId))
  },

  /**
   * Limpia toda la data de una llamada.
   */
  async clearCall(redis: Redis, llamadaId: number): Promise<void> {
    await redis.del(callKey(llamadaId))
  },
}
