import type { RedisClient as Redis } from '../../libs/redis.js'
import type { Server, Socket } from 'socket.io'
import { env } from '../../config/env.js'
import { db } from '../../db/client.js'
import { conversacionesService } from '../../services/conversaciones.service.js'
import { llamadasService } from '../../services/llamadas.service.js'
import { callTracker } from '../callTracker.js'

interface InitiateCallPayload {
  conversacionId: number
  tipo: 'voz' | 'video'
}

interface CallResponsePayload {
  llamadaId: number
  accepted: boolean
}

interface JoinCallPayload {
  llamadaId: number
}

interface EndCallPayload {
  llamadaId: number
}

export function setupCallHandlers(io: Server, socket: Socket, redis: Redis) {
  const userId = socket.data.userId as number
  const socketDb = db

  // -----------------------------------------------------------------------
  // Iniciar llamada
  // -----------------------------------------------------------------------
  socket.on('call:initiate', async ({ conversacionId, tipo }: InitiateCallPayload) => {
    try {
      const esParticipante = await conversacionesService.verificarParticipante(
        socketDb,
        conversacionId,
        userId
      )
      if (!esParticipante) {
        socket.emit('call:error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      const existing = await llamadasService.obtenerLlamadaActiva(socketDb, conversacionId)
      if (existing) {
        socket.emit('call:error', { message: 'Ya hay una llamada activa en esta conversación' })
        return
      }

      const caller = await llamadasService.obtenerUsuario(socketDb, userId)
      if (!caller) {
        socket.emit('call:error', { message: 'Usuario no encontrado' })
        return
      }

      const roomName = llamadasService.generateRoomName(conversacionId)
      const llamada = await llamadasService.crearLlamada(socketDb, {
        conversacionId,
        iniciadoPor: userId,
        tipo,
        estado: 'sonando',
        livekitRoom: roomName,
      })

      const token = await llamadasService.generateToken(roomName, userId, caller.nombreCompleto)

      // Registrar caller como participante (con socketId específico)
      await callTracker.addParticipant(redis, llamada.id, userId, socket.id)

      socket.emit('call:created', {
        llamadaId: llamada.id,
        token,
        livekitUrl: env.LIVEKIT_URL,
        roomName,
        tipo,
      })

      // Notificar a los demás participantes de la conversación
      const participanteIds = await llamadasService.obtenerParticipanteIds(
        socketDb,
        conversacionId
      )
      for (const targetId of participanteIds) {
        if (targetId !== userId) {
          io.to(`user:${targetId}`).emit('call:incoming', {
            llamadaId: llamada.id,
            conversacionId,
            callerId: userId,
            callerName: caller.nombreCompleto,
            tipo,
          })
        }
      }

      console.log(`[Call] Llamada ${llamada.id} iniciada en conversación ${conversacionId}`)

      // Auto-timeout 30s si nadie contesta
      setTimeout(async () => {
        try {
          const current = await llamadasService.obtenerPorId(socketDb, llamada.id)
          if (current && current.estado === 'sonando') {
            await llamadasService.rechazarLlamada(socketDb, llamada.id, 'sin_respuesta')
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:ended', {
                llamadaId: llamada.id,
                reason: 'sin_respuesta',
              })
            }
            await callTracker.clearCall(redis, llamada.id)
          }
        } catch (err) {
          console.error(`[Call] Error en auto-timeout de llamada ${llamada.id}:`, err)
        }
      }, 30000)
    } catch (error) {
      console.error('[Call] Error iniciando llamada:', error)
      socket.emit('call:error', { message: 'Error al iniciar llamada' })
    }
  })

  // -----------------------------------------------------------------------
  // Responder a llamada entrante
  // -----------------------------------------------------------------------
  socket.on('call:response', async ({ llamadaId, accepted }: CallResponsePayload) => {
    try {
      const llamada = await llamadasService.obtenerPorId(socketDb, llamadaId)
      if (!llamada) {
        socket.emit('call:error', { message: 'Llamada no encontrada' })
        return
      }

      if (llamada.estado !== 'sonando') {
        socket.emit('call:error', { message: 'La llamada ya no está disponible' })
        return
      }

      if (accepted) {
        await llamadasService.actualizarEstado(socketDb, llamadaId, 'activa')

        const user = await llamadasService.obtenerUsuario(socketDb, userId)
        if (!user) {
          socket.emit('call:error', { message: 'Usuario no encontrado' })
          return
        }

        const token = await llamadasService.generateToken(
          llamada.livekitRoom,
          userId,
          user.nombreCompleto
        )

        await callTracker.addParticipant(redis, llamadaId, userId, socket.id)

        socket.emit('call:accepted', {
          llamadaId,
          token,
          livekitUrl: env.LIVEKIT_URL,
          roomName: llamada.livekitRoom,
          tipo: llamada.tipo,
        })

        io.to(`user:${llamada.iniciadoPor}`).emit('call:participant-joined', {
          llamadaId,
          userId,
        })

        console.log(`[Call] Llamada ${llamadaId} aceptada por usuario ${userId}`)
      } else {
        const conv = await conversacionesService.obtenerConversacionPorId(
          socketDb,
          llamada.conversacionId
        )

        if (conv?.tipo === 'directa') {
          await llamadasService.rechazarLlamada(socketDb, llamadaId, 'rechazada')
          const participanteIds = await llamadasService.obtenerParticipanteIds(
            socketDb,
            llamada.conversacionId
          )
          for (const pid of participanteIds) {
            io.to(`user:${pid}`).emit('call:ended', { llamadaId, reason: 'rechazada' })
          }
          await callTracker.clearCall(redis, llamadaId)
        } else {
          io.to(`user:${llamada.iniciadoPor}`).emit('call:participant-declined', {
            llamadaId,
            userId,
          })
        }

        console.log(`[Call] Llamada ${llamadaId} rechazada por usuario ${userId}`)
      }
    } catch (error) {
      console.error('[Call] Error respondiendo llamada:', error)
      socket.emit('call:error', { message: 'Error al responder llamada' })
    }
  })

  // -----------------------------------------------------------------------
  // Unirse a llamada activa (late join en grupo)
  // -----------------------------------------------------------------------
  socket.on('call:join', async ({ llamadaId }: JoinCallPayload) => {
    try {
      const llamada = await llamadasService.obtenerPorId(socketDb, llamadaId)
      if (!llamada || llamada.estado !== 'activa') {
        socket.emit('call:error', { message: 'Llamada no encontrada o no activa' })
        return
      }

      const esParticipante = await conversacionesService.verificarParticipante(
        socketDb,
        llamada.conversacionId,
        userId
      )
      if (!esParticipante) {
        socket.emit('call:error', { message: 'No tienes acceso a esta conversación' })
        return
      }

      const user = await llamadasService.obtenerUsuario(socketDb, userId)
      if (!user) {
        socket.emit('call:error', { message: 'Usuario no encontrado' })
        return
      }

      const token = await llamadasService.generateToken(
        llamada.livekitRoom,
        userId,
        user.nombreCompleto
      )

      await callTracker.addParticipant(redis, llamadaId, userId, socket.id)

      socket.emit('call:accepted', {
        llamadaId,
        token,
        livekitUrl: env.LIVEKIT_URL,
        roomName: llamada.livekitRoom,
        tipo: llamada.tipo,
      })

      const participanteIds = await llamadasService.obtenerParticipanteIds(
        socketDb,
        llamada.conversacionId
      )
      for (const pid of participanteIds) {
        if (pid !== userId) {
          io.to(`user:${pid}`).emit('call:participant-joined', { llamadaId, userId })
        }
      }
    } catch (error) {
      console.error('[Call] Error uniéndose a llamada:', error)
      socket.emit('call:error', { message: 'Error al unirse a la llamada' })
    }
  })

  // -----------------------------------------------------------------------
  // Finalizar llamada
  // -----------------------------------------------------------------------
  socket.on('call:end', async ({ llamadaId }: EndCallPayload) => {
    try {
      const llamada = await llamadasService.obtenerPorId(socketDb, llamadaId)
      if (!llamada) return

      const participantUserIds = await callTracker.getParticipantUserIds(redis, llamadaId)

      await llamadasService.finalizarLlamada(socketDb, llamadaId, participantUserIds)

      const participanteIds = await llamadasService.obtenerParticipanteIds(
        socketDb,
        llamada.conversacionId
      )
      for (const pid of participanteIds) {
        io.to(`user:${pid}`).emit('call:ended', { llamadaId, reason: 'finalizada' })
      }

      await callTracker.clearCall(redis, llamadaId)
      console.log(`[Call] Llamada ${llamadaId} finalizada`)
    } catch (error) {
      console.error('[Call] Error finalizando llamada:', error)
      socket.emit('call:error', { message: 'Error al finalizar llamada' })
    }
  })

  // -----------------------------------------------------------------------
  // Limpieza al desconectarse — solo elimina ESTE socket de las llamadas
  // -----------------------------------------------------------------------
  socket.on('disconnect', async () => {
    try {
      const llamadaIds = await callTracker.getCallsForSocket(redis, userId, socket.id)

      for (const llamadaId of llamadaIds) {
        const { totalRemaining, userHasOtherSockets } = await callTracker.removeSocket(
          redis,
          llamadaId,
          userId,
          socket.id
        )

        if (totalRemaining === 0) {
          // Ningún socket en la llamada → finalizar
          const llamada = await llamadasService.obtenerPorId(socketDb, llamadaId)
          if (llamada && (llamada.estado === 'activa' || llamada.estado === 'sonando')) {
            await llamadasService.finalizarLlamada(socketDb, llamadaId, [])
            const participanteIds = await llamadasService.obtenerParticipanteIds(
              socketDb,
              llamada.conversacionId
            )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:ended', { llamadaId, reason: 'finalizada' })
            }
            await callTracker.clearCall(redis, llamadaId)
          }
        } else if (!userHasOtherSockets) {
          // Este usuario ya no tiene sockets en la llamada, pero otros usuarios sí
          const llamada = await llamadasService.obtenerPorId(socketDb, llamadaId)
          if (llamada) {
            const participanteIds = await llamadasService.obtenerParticipanteIds(
              socketDb,
              llamada.conversacionId
            )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:participant-left', { llamadaId, userId })
            }
          }
        }
        // Si userHasOtherSockets === true → este socket se desconectó pero el usuario
        // sigue en la llamada con otro socket. No hacer nada.
      }
    } catch (error) {
      console.error('[Call] Error en limpieza de disconnect:', error)
    }
  })
}
