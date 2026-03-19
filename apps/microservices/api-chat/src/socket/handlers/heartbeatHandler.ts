import { eq } from 'drizzle-orm'
import type { Socket } from 'socket.io'
import { db } from '../../db/client.js'
import { estadoUsuarios } from '../../db/schemas/estadoUsuarios.schema.js'
import type { RedisClient as Redis } from '../../libs/redis.js'
import { connectionTracker } from '../connectionTracker.js'

/**
 * Heartbeat aplicativo: el cliente envía 'heartbeat:ping' cada 60s,
 * el server renueva el TTL en Redis y actualiza ultimaConexion en DB.
 *
 * Esto complementa el ping/pong de transporte de Socket.IO que no
 * toca Redis ni la base de datos.
 */
export function setupHeartbeatHandler(socket: Socket, redis: Redis) {
  const userId = socket.data.userId as number

  socket.on('heartbeat:ping', async () => {
    try {
      // Renovar TTL en Redis
      await connectionTracker.refreshTTL(redis, userId)

      // Actualizar ultimaConexion en DB
      await db
        .update(estadoUsuarios)
        .set({ ultimaConexion: new Date() })
        .where(eq(estadoUsuarios.usuarioId, userId))

      socket.emit('heartbeat:pong')
    } catch (error) {
      console.error('[Heartbeat] Error:', error)
    }
  })
}
