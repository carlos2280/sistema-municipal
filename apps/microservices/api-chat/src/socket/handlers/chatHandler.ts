import type { Server, Socket } from 'socket.io'
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

  // Unirse a una sala de conversación
  socket.on('chat:join', async ({ conversacionId }: ChatJoinPayload) => {
    try {
      // Verificar que el usuario es participante
      const esParticipante = await conversacionesService.verificarParticipante(
        conversacionId,
        userId
      )

      if (!esParticipante) {
        socket.emit('error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      const room = `conversation:${conversacionId}`
      socket.join(room)
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
        conversacionId,
        userId
      )

      if (!esParticipante) {
        socket.emit('error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      // Crear mensaje en BD (incluye datos del remitente)
      const mensaje = await mensajesService.crearMensaje({
        conversacionId,
        remitenteId: userId,
        contenido,
        tipo,
      })

      // Emitir a todos en la sala (incluyendo al remitente)
      const room = `conversation:${conversacionId}`
      io.to(room).emit('chat:message', mensaje)

      console.log(`[Socket] Mensaje enviado en conversación ${conversacionId}`)
    } catch (error) {
      console.error('[Socket] Error en chat:message:', error)
      socket.emit('error', { message: 'Error al enviar mensaje' })
    }
  })

  // Indicador de escritura
  socket.on('chat:typing', ({ conversacionId, isTyping }: TypingPayload) => {
    const room = `conversation:${conversacionId}`
    socket.to(room).emit('chat:typing', {
      userId,
      isTyping,
    })
  })
}
