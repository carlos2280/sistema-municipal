import type { Server, Socket } from 'socket.io'
import { env } from '../../config/env.js'
import { conversacionesService } from '../../services/conversaciones.service.js'
import { llamadasService } from '../../services/llamadas.service.js'

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

// Tracking de quién está en cada llamada (para limpieza al desconectar)
const activeCallParticipants = new Map<number, Set<number>>()

export function setupCallHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as number

  // Iniciar llamada
  socket.on(
    'call:initiate',
    async ({ conversacionId, tipo }: InitiateCallPayload) => {
      try {
        const esParticipante =
          await conversacionesService.verificarParticipante(
            conversacionId,
            userId
          )
        if (!esParticipante) {
          socket.emit('call:error', {
            message: 'No tienes acceso a esta conversación',
          })
          return
        }

        const existing =
          await llamadasService.obtenerLlamadaActiva(conversacionId)
        if (existing) {
          socket.emit('call:error', {
            message: 'Ya hay una llamada activa en esta conversación',
          })
          return
        }

        const caller = await llamadasService.obtenerUsuario(userId)
        if (!caller) {
          socket.emit('call:error', { message: 'Usuario no encontrado' })
          return
        }

        const roomName = llamadasService.generateRoomName(conversacionId)
        const llamada = await llamadasService.crearLlamada({
          conversacionId,
          iniciadoPor: userId,
          tipo,
          estado: 'sonando',
          livekitRoom: roomName,
        })

        const token = await llamadasService.generateToken(
          roomName,
          userId,
          caller.nombreCompleto
        )

        activeCallParticipants.set(llamada.id, new Set([userId]))

        socket.emit('call:created', {
          llamadaId: llamada.id,
          token,
          livekitUrl: env.LIVEKIT_URL,
          roomName,
          tipo,
        })

        const participanteIds =
          await llamadasService.obtenerParticipanteIds(conversacionId)
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

        console.log(
          `[Socket] Llamada ${llamada.id} iniciada en conversación ${conversacionId}`
        )

        // Auto-timeout 30s si nadie contesta
        setTimeout(async () => {
          const current = await llamadasService.obtenerPorId(llamada.id)
          if (current && current.estado === 'sonando') {
            await llamadasService.rechazarLlamada(
              llamada.id,
              'sin_respuesta'
            )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:ended', {
                llamadaId: llamada.id,
                reason: 'sin_respuesta',
              })
            }
            activeCallParticipants.delete(llamada.id)
          }
        }, 30000)
      } catch (error) {
        console.error('[Socket] Error iniciando llamada:', error)
        socket.emit('call:error', { message: 'Error al iniciar llamada' })
      }
    }
  )

  // Responder a llamada entrante
  socket.on(
    'call:response',
    async ({ llamadaId, accepted }: CallResponsePayload) => {
      try {
        const llamada = await llamadasService.obtenerPorId(llamadaId)
        if (!llamada) {
          socket.emit('call:error', { message: 'Llamada no encontrada' })
          return
        }

        if (llamada.estado !== 'sonando') {
          socket.emit('call:error', {
            message: 'La llamada ya no está disponible',
          })
          return
        }

        if (accepted) {
          await llamadasService.actualizarEstado(llamadaId, 'activa')

          const user = await llamadasService.obtenerUsuario(userId)
          if (!user) {
            socket.emit('call:error', { message: 'Usuario no encontrado' })
            return
          }

          const token = await llamadasService.generateToken(
            llamada.livekitRoom,
            userId,
            user.nombreCompleto
          )

          const participants =
            activeCallParticipants.get(llamadaId) || new Set()
          participants.add(userId)
          activeCallParticipants.set(llamadaId, participants)

          socket.emit('call:accepted', {
            llamadaId,
            token,
            livekitUrl: env.LIVEKIT_URL,
            roomName: llamada.livekitRoom,
            tipo: llamada.tipo,
          })

          io.to(`user:${llamada.iniciadoPor}`).emit(
            'call:participant-joined',
            { llamadaId, userId }
          )

          console.log(
            `[Socket] Llamada ${llamadaId} aceptada por usuario ${userId}`
          )
        } else {
          const conv = await conversacionesService.obtenerConversacionPorId(
            llamada.conversacionId
          )

          if (conv?.tipo === 'directa') {
            await llamadasService.rechazarLlamada(llamadaId, 'rechazada')
            const participanteIds =
              await llamadasService.obtenerParticipanteIds(
                llamada.conversacionId
              )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:ended', {
                llamadaId,
                reason: 'rechazada',
              })
            }
            activeCallParticipants.delete(llamadaId)
          } else {
            io.to(`user:${llamada.iniciadoPor}`).emit(
              'call:participant-declined',
              { llamadaId, userId }
            )
          }

          console.log(
            `[Socket] Llamada ${llamadaId} rechazada por usuario ${userId}`
          )
        }
      } catch (error) {
        console.error('[Socket] Error respondiendo llamada:', error)
        socket.emit('call:error', { message: 'Error al responder llamada' })
      }
    }
  )

  // Unirse a llamada activa (late join en grupo)
  socket.on('call:join', async ({ llamadaId }: JoinCallPayload) => {
    try {
      const llamada = await llamadasService.obtenerPorId(llamadaId)
      if (!llamada || llamada.estado !== 'activa') {
        socket.emit('call:error', {
          message: 'Llamada no encontrada o no activa',
        })
        return
      }

      const esParticipante =
        await conversacionesService.verificarParticipante(
          llamada.conversacionId,
          userId
        )
      if (!esParticipante) {
        socket.emit('call:error', {
          message: 'No tienes acceso a esta conversación',
        })
        return
      }

      const user = await llamadasService.obtenerUsuario(userId)
      if (!user) {
        socket.emit('call:error', { message: 'Usuario no encontrado' })
        return
      }

      const token = await llamadasService.generateToken(
        llamada.livekitRoom,
        userId,
        user.nombreCompleto
      )

      const participants =
        activeCallParticipants.get(llamadaId) || new Set()
      participants.add(userId)
      activeCallParticipants.set(llamadaId, participants)

      socket.emit('call:accepted', {
        llamadaId,
        token,
        livekitUrl: env.LIVEKIT_URL,
        roomName: llamada.livekitRoom,
        tipo: llamada.tipo,
      })

      const participanteIds = await llamadasService.obtenerParticipanteIds(
        llamada.conversacionId
      )
      for (const pid of participanteIds) {
        if (pid !== userId) {
          io.to(`user:${pid}`).emit('call:participant-joined', {
            llamadaId,
            userId,
          })
        }
      }
    } catch (error) {
      console.error('[Socket] Error uniéndose a llamada:', error)
      socket.emit('call:error', { message: 'Error al unirse a la llamada' })
    }
  })

  // Finalizar llamada
  socket.on('call:end', async ({ llamadaId }: EndCallPayload) => {
    try {
      const llamada = await llamadasService.obtenerPorId(llamadaId)
      if (!llamada) return

      const participants = activeCallParticipants.get(llamadaId)
      const participantsArray = participants ? Array.from(participants) : []

      await llamadasService.finalizarLlamada(llamadaId, participantsArray)

      const participanteIds = await llamadasService.obtenerParticipanteIds(
        llamada.conversacionId
      )
      for (const pid of participanteIds) {
        io.to(`user:${pid}`).emit('call:ended', {
          llamadaId,
          reason: 'finalizada',
        })
      }

      activeCallParticipants.delete(llamadaId)
      console.log(`[Socket] Llamada ${llamadaId} finalizada`)
    } catch (error) {
      console.error('[Socket] Error finalizando llamada:', error)
      socket.emit('call:error', { message: 'Error al finalizar llamada' })
    }
  })

  // Limpieza al desconectarse
  socket.on('disconnect', async () => {
    for (const [llamadaId, participants] of activeCallParticipants.entries()) {
      if (participants.has(userId)) {
        participants.delete(userId)

        if (participants.size === 0) {
          const llamada = await llamadasService.obtenerPorId(llamadaId)
          if (
            llamada &&
            (llamada.estado === 'activa' || llamada.estado === 'sonando')
          ) {
            await llamadasService.finalizarLlamada(llamadaId, [])
            const participanteIds =
              await llamadasService.obtenerParticipanteIds(
                llamada.conversacionId
              )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:ended', {
                llamadaId,
                reason: 'finalizada',
              })
            }
            activeCallParticipants.delete(llamadaId)
          }
        } else {
          const llamada = await llamadasService.obtenerPorId(llamadaId)
          if (llamada) {
            const participanteIds =
              await llamadasService.obtenerParticipanteIds(
                llamada.conversacionId
              )
            for (const pid of participanteIds) {
              io.to(`user:${pid}`).emit('call:participant-left', {
                llamadaId,
                userId,
              })
            }
          }
        }
      }
    }
  })
}
