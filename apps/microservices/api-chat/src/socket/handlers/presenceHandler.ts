import { eq } from 'drizzle-orm'
import type { Server, Socket } from 'socket.io'
import { db } from '../../db/client.js'
import { estadoUsuarios } from '../../db/schemas/estadoUsuarios.schema.js'

export function setupPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as number

  // Marcar usuario como online al conectar
  const setOnline = async () => {
    try {
      await db
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

      // Notificar a todos que el usuario está online
      socket.broadcast.emit('user:online', { userId })
      console.log(`[Socket] Usuario ${userId} está online`)
    } catch (error) {
      console.error('[Socket] Error actualizando estado online:', error)
    }
  }

  // Marcar usuario como offline al desconectar
  const setOffline = async () => {
    try {
      await db
        .update(estadoUsuarios)
        .set({
          estado: 'offline',
          socketId: null,
          ultimaConexion: new Date(),
        })
        .where(eq(estadoUsuarios.usuarioId, userId))

      // Notificar a todos que el usuario está offline
      socket.broadcast.emit('user:offline', { userId })
      console.log(`[Socket] Usuario ${userId} está offline`)
    } catch (error) {
      console.error('[Socket] Error actualizando estado offline:', error)
    }
  }

  // Obtener lista de usuarios online
  socket.on('presence:get-online', async () => {
    try {
      const onlineUsers = await db
        .select({ usuarioId: estadoUsuarios.usuarioId })
        .from(estadoUsuarios)
        .where(eq(estadoUsuarios.estado, 'online'))

      const userIds = onlineUsers.map((u) => u.usuarioId)
      socket.emit('presence:online-list', userIds)
    } catch (error) {
      console.error('[Socket] Error obteniendo usuarios online:', error)
      socket.emit('presence:online-list', [])
    }
  })

  // Cambiar estado manualmente
  socket.on('presence:status', async ({ status }: { status: 'online' | 'away' | 'busy' }) => {
    try {
      await db
        .update(estadoUsuarios)
        .set({ estado: status })
        .where(eq(estadoUsuarios.usuarioId, userId))

      socket.broadcast.emit('user:status', { userId, status })
    } catch (error) {
      console.error('[Socket] Error cambiando estado:', error)
    }
  })

  // Ejecutar setOnline al inicializar
  setOnline()

  // Registrar handler de desconexión
  socket.on('disconnect', setOffline)
}
