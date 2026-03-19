import { and, eq, lt } from 'drizzle-orm'
import type { Server } from 'socket.io'
import { db } from '../db/client.js'
import { estadoUsuarios } from '../db/schemas/estadoUsuarios.schema.js'
import type { RedisClient as Redis } from '../libs/redis.js'
import { connectionTracker } from './connectionTracker.js'

const CLEANUP_INTERVAL = 2 * 60 * 1000 // Cada 2 minutos
const STALE_THRESHOLD = 5 * 60 * 1000 // 5 minutos sin heartbeat = stale

/**
 * Job periódico que detecta y limpia conexiones fantasma.
 *
 * Paso 1: Verifica socketIds en Redis contra sockets reales de Socket.IO
 * Paso 2: Marca offline usuarios con ultimaConexion > 5 min y sin sockets en Redis
 */
export function startPresenceCleanup(io: Server, redis: Redis) {
  async function cleanup() {
    try {
      // ── Paso 1: Limpiar Redis — verificar que cada socketId exista en Socket.IO ──
      const keys = await connectionTracker.getAllConnectionKeys(redis)

      for (const key of keys) {
        const socketIds = await redis.smembers(key)
        const userId = Number.parseInt(key.replace('conn:user:', ''), 10)
        let removed = 0

        for (const socketId of socketIds) {
          const socketExists = io.sockets.sockets.has(socketId)
          if (!socketExists) {
            await redis.srem(key, socketId)
            removed++
          }
        }

        // Si removimos todos los sockets → marcar offline
        if (removed > 0) {
          const remaining = await redis.scard(key)
          if (remaining === 0) {
            await db
              .update(estadoUsuarios)
              .set({
                estado: 'offline',
                socketId: null,
                ultimaConexion: new Date(),
              })
              .where(eq(estadoUsuarios.usuarioId, userId))

            io.emit('user:offline', { userId })
            console.log(
              `[PresenceCleanup] Usuario ${userId} marcado offline (sockets fantasma limpiados)`,
            )
          }
        }
      }

      // ── Paso 2: Fallback DB — marcar offline si ultimaConexion > threshold ──
      const staleThreshold = new Date(Date.now() - STALE_THRESHOLD)

      const staleUsers = await db
        .select({ usuarioId: estadoUsuarios.usuarioId })
        .from(estadoUsuarios)
        .where(
          and(
            eq(estadoUsuarios.estado, 'online'),
            lt(estadoUsuarios.ultimaConexion, staleThreshold),
          ),
        )

      for (const { usuarioId } of staleUsers) {
        // Verificar en Redis antes de marcar offline (por si el heartbeat renovó)
        const isConnected = await connectionTracker.isUserConnected(
          redis,
          usuarioId,
        )
        if (!isConnected) {
          await db
            .update(estadoUsuarios)
            .set({
              estado: 'offline',
              socketId: null,
              ultimaConexion: new Date(),
            })
            .where(eq(estadoUsuarios.usuarioId, usuarioId))

          io.emit('user:offline', { userId: usuarioId })
          console.log(
            `[PresenceCleanup] Usuario ${usuarioId} marcado offline (stale: última conexión > ${STALE_THRESHOLD / 1000}s)`,
          )
        }
      }
    } catch (error) {
      console.error('[PresenceCleanup] Error:', error)
    }
  }

  // Ejecutar inmediatamente al iniciar (limpia fantasmas del deploy anterior)
  cleanup()

  // Programar ejecución periódica
  const timer = setInterval(cleanup, CLEANUP_INTERVAL)

  return () => clearInterval(timer)
}
