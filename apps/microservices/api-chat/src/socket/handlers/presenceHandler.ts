import { eq } from 'drizzle-orm'
import type { RedisClient as Redis } from '../../libs/redis.js'
import type { Server, Socket } from 'socket.io'
import { db } from '../../db/client.js'
import { estadoUsuarios } from '../../db/schemas/estadoUsuarios.schema.js'
import { connectionTracker } from '../connectionTracker.js'

export function setupPresenceHandlers(_io: Server, socket: Socket, redis: Redis) {
  const userId = socket.data.userId as number
  const socketDb = db

  // -----------------------------------------------------------------------
  // Registrar conexión
  // -----------------------------------------------------------------------
  const registerConnection = async () => {
    try {
      const totalSockets = await connectionTracker.addSocket(redis, userId, socket.id)

      // Actualizar estado en DB (siempre online mientras haya al menos 1 socket)
      await socketDb
        .insert(estadoUsuarios)
        .values({
          usuarioId: userId,
          estado: 'online',
          socketId: socket.id,
          ultimaConexion: new Date(),
        })
        .onConflictDoUpdate({
          target: estadoUsuarios.usuarioId,
          set: {
            estado: 'online',
            socketId: socket.id,
            ultimaConexion: new Date(),
          },
        })

      // Solo notificar online si es el primer socket (evita broadcasts redundantes)
      if (totalSockets === 1) {
        socket.broadcast.emit('user:online', { userId })
      }

      console.log(
        `[Presence] Usuario ${userId} conectado (socket: ${socket.id}, total: ${totalSockets})`
      )
    } catch (error) {
      console.error('[Presence] Error registrando conexión:', error)
    }
  }

  // -----------------------------------------------------------------------
  // Desregistrar conexión
  // -----------------------------------------------------------------------
  const unregisterConnection = async () => {
    try {
      const remainingSockets = await connectionTracker.removeSocket(redis, userId, socket.id)

      if (remainingSockets === 0) {
        // Último socket desconectado → marcar offline
        await socketDb
          .update(estadoUsuarios)
          .set({
            estado: 'offline',
            socketId: null,
            ultimaConexion: new Date(),
          })
          .where(eq(estadoUsuarios.usuarioId, userId))

        socket.broadcast.emit('user:offline', { userId })
        console.log(`[Presence] Usuario ${userId} offline (último socket desconectado)`)
      } else {
        console.log(
          `[Presence] Socket ${socket.id} desconectado, usuario ${userId} sigue online (restantes: ${remainingSockets})`
        )
      }
    } catch (error) {
      console.error('[Presence] Error desregistrando conexión:', error)
    }
  }

  // -----------------------------------------------------------------------
  // Obtener lista de usuarios online
  // -----------------------------------------------------------------------
  socket.on('presence:get-online', async () => {
    try {
      const onlineUsers = await socketDb
        .select({ usuarioId: estadoUsuarios.usuarioId })
        .from(estadoUsuarios)
        .where(eq(estadoUsuarios.estado, 'online'))

      socket.emit(
        'presence:online-list',
        onlineUsers.map((u) => u.usuarioId)
      )
    } catch (error) {
      console.error('[Presence] Error obteniendo usuarios online:', error)
      socket.emit('presence:online-list', [])
    }
  })

  // -----------------------------------------------------------------------
  // Cambiar estado manualmente (away, busy, online)
  // -----------------------------------------------------------------------
  socket.on('presence:status', async ({ status }: { status: 'online' | 'away' | 'busy' }) => {
    try {
      await socketDb
        .update(estadoUsuarios)
        .set({ estado: status })
        .where(eq(estadoUsuarios.usuarioId, userId))

      socket.broadcast.emit('user:status', { userId, status })
    } catch (error) {
      console.error('[Presence] Error cambiando estado:', error)
    }
  })

  // Ejecutar al inicializar
  registerConnection()

  // Registrar handler de desconexión
  socket.on('disconnect', unregisterConnection)
}
