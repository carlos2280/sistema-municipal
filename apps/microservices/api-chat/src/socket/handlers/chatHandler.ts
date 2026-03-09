import { and, eq } from 'drizzle-orm'
import type { Server, Socket } from 'socket.io'
import { db } from '../../db/client.js'
import { participantes } from '../../db/schemas/participantes.schema.js'
import { conversacionesService } from '../../services/conversaciones.service.js'
import { mensajesService } from '../../services/mensajes.service.js'

interface ChatJoinPayload {
  conversacionId: number
}

interface ChatMessagePayload {
  conversacionId: number
  contenido: string
  tipo?: 'texto' | 'archivo' | 'imagen'
}

interface TypingPayload {
  conversacionId: number
  isTyping: boolean
}

export function setupChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as number
  // Para sockets se usa la DB por defecto como fallback.
  // En el futuro se puede extraer el tenant del handshake/JWT.
  const socketDb = db

  // Unirse a una sala de conversación
  socket.on('chat:join', async ({ conversacionId }: ChatJoinPayload) => {
    try {
      // Verificar que el usuario es participante
      const esParticipante = await conversacionesService.verificarParticipante(
        socketDb,
        conversacionId,
        userId
      )

      if (!esParticipante) {
        socket.emit('error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      const room = `conversation:${conversacionId}`
      socket.join(room)

      // Marcar como leído al unirse a la conversación
      await socketDb
        .update(participantes)
        .set({ ultimaLectura: new Date() })
        .where(
          and(
            eq(participantes.conversacionId, conversacionId),
            eq(participantes.usuarioId, userId),
          )
        )

      console.log(`[Socket] Usuario ${userId} se unió a ${room}`)
    } catch (error) {
      console.error('[Socket] Error en chat:join:', error)
      socket.emit('error', { message: 'Error al unirse a la conversación' })
    }
  })

  // Salir de una sala de conversación
  socket.on('chat:leave', ({ conversacionId }: ChatJoinPayload) => {
    const room = `conversation:${conversacionId}`
    socket.leave(room)
    console.log(`[Socket] Usuario ${userId} salió de ${room}`)
  })

  // Enviar mensaje
  socket.on('chat:message', async ({ conversacionId, contenido, tipo = 'texto' }: ChatMessagePayload) => {
    try {
      // Verificar acceso
      const esParticipante = await conversacionesService.verificarParticipante(
        socketDb,
        conversacionId,
        userId
      )

      if (!esParticipante) {
        socket.emit('error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      // Crear mensaje en BD (incluye datos del remitente)
      const mensaje = await mensajesService.crearMensaje(socketDb, {
        conversacionId,
        remitenteId: userId,
        contenido,
        tipo,
      })

      // Emitir a la sala de conversación (quienes la tienen abierta)
      const room = `conversation:${conversacionId}`
      io.to(room).emit('chat:message', mensaje)

      // Emitir a las salas personales de TODOS los participantes
      // para que actualicen su lista de conversaciones (preview, no leídos, orden)
      const participantesConv = await conversacionesService.obtenerParticipantes(socketDb, conversacionId)
      for (const p of participantesConv) {
        if (p.usuarioId !== userId) {
          io.to(`user:${p.usuarioId}`).emit('chat:message', mensaje)
        }
      }

      console.log(`[Socket] Mensaje enviado en conversación ${conversacionId}`)
    } catch (error) {
      console.error('[Socket] Error en chat:message:', error)
      socket.emit('error', { message: 'Error al enviar mensaje' })
    }
  })

  // Marcar conversación como leída (cuando el usuario está viendo y llegan mensajes)
  socket.on('chat:read', async ({ conversacionId }: ChatJoinPayload) => {
    try {
      await socketDb
        .update(participantes)
        .set({ ultimaLectura: new Date() })
        .where(
          and(
            eq(participantes.conversacionId, conversacionId),
            eq(participantes.usuarioId, userId),
          )
        )
    } catch (error) {
      console.error('[Socket] Error en chat:read:', error)
    }
  })

  // Indicador de escritura
  socket.on('chat:typing', ({ conversacionId, isTyping }: TypingPayload) => {
    const room = `conversation:${conversacionId}`
    socket.to(room).emit('chat:typing', {
      userId,
      isTyping,
      conversacionId,
    })
  })
}
