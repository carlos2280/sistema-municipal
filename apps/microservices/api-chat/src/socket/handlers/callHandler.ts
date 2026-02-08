import { eq } from 'drizzle-orm'
import type { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db/client.js'
import { estadoUsuarios } from '../../db/schemas/estadoUsuarios.schema.js'

interface InitiateCallPayload {
  targetUserId: number
}

interface CallSignalPayload {
  targetUserId: number
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit
}

interface CallResponsePayload {
  callId: string
  accepted: boolean
}

const activeCalls = new Map<string, { callerId: number; targetId: number }>()

export function setupCallHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as number

  // Iniciar llamada
  socket.on('call:initiate', async ({ targetUserId }: InitiateCallPayload) => {
    try {
      // Buscar socket del usuario destino
      const [targetUser] = await db
        .select()
        .from(estadoUsuarios)
        .where(eq(estadoUsuarios.usuarioId, targetUserId))

      if (!targetUser?.socketId || targetUser.estado === 'offline') {
        socket.emit('call:error', { message: 'Usuario no disponible' })
        return
      }

      const callId = uuidv4()
      activeCalls.set(callId, { callerId: userId, targetId: targetUserId })

      // Notificar al usuario destino
      io.to(targetUser.socketId).emit('call:incoming', {
        callId,
        callerId: userId,
        callerName: `Usuario ${userId}`, // TODO: Obtener nombre real
      })

      // Notificar al iniciador que se está llamando
      socket.emit('call:ringing', { callId, targetUserId })

      console.log(`[Socket] Llamada iniciada: ${callId}`)
    } catch (error) {
      console.error('[Socket] Error iniciando llamada:', error)
      socket.emit('call:error', { message: 'Error al iniciar llamada' })
    }
  })

  // Responder a llamada
  socket.on('call:response', async ({ callId, accepted }: CallResponsePayload) => {
    const call = activeCalls.get(callId)
    if (!call) {
      socket.emit('call:error', { message: 'Llamada no encontrada' })
      return
    }

    // Buscar socket del llamador
    const [callerUser] = await db
      .select()
      .from(estadoUsuarios)
      .where(eq(estadoUsuarios.usuarioId, call.callerId))

    if (!callerUser?.socketId) {
      socket.emit('call:error', { message: 'Llamador no disponible' })
      return
    }

    if (accepted) {
      io.to(callerUser.socketId).emit('call:accepted', { callId })
      socket.emit('call:connected', { callId })
      console.log(`[Socket] Llamada aceptada: ${callId}`)
    } else {
      io.to(callerUser.socketId).emit('call:declined', { callId })
      activeCalls.delete(callId)
      console.log(`[Socket] Llamada rechazada: ${callId}`)
    }
  })

  // Enviar señal WebRTC
  socket.on('call:signal', async ({ targetUserId, signal }: CallSignalPayload) => {
    const [targetUser] = await db
      .select()
      .from(estadoUsuarios)
      .where(eq(estadoUsuarios.usuarioId, targetUserId))

    if (targetUser?.socketId) {
      io.to(targetUser.socketId).emit('call:signal', {
        fromUserId: userId,
        signal,
      })
    }
  })

  // Finalizar llamada
  socket.on('call:end', async ({ callId }: { callId: string }) => {
    const call = activeCalls.get(callId)
    if (!call) return

    const otherUserId = call.callerId === userId ? call.targetId : call.callerId

    const [otherUser] = await db
      .select()
      .from(estadoUsuarios)
      .where(eq(estadoUsuarios.usuarioId, otherUserId))

    if (otherUser?.socketId) {
      io.to(otherUser.socketId).emit('call:ended', {
        callId,
        reason: 'ended',
      })
    }

    activeCalls.delete(callId)
    console.log(`[Socket] Llamada finalizada: ${callId}`)
  })
}
