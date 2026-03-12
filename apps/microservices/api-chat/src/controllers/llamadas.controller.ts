import { and, eq } from 'drizzle-orm'
import type { Request, RequestHandler } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { invitacionesReunion, reuniones } from '../db/schemas/index.js'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'
import { llamadasService } from '../services/llamadas.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

export const obtenerHistorial: RequestHandler = async (req, res, next) => {
  try {
    const { conversacionId } = req.params
    const usuarioId = req.usuario?.id
    if (!usuarioId) throw new AppError('Usuario no autenticado', 401)

    const tenantDb = getDb(req)

    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      Number(conversacionId),
      usuarioId
    )
    if (!esParticipante)
      throw new AppError('No tienes acceso a esta conversación', 403)

    const historial = await llamadasService.obtenerHistorial(
      tenantDb,
      Number(conversacionId)
    )
    res.json({ success: true, data: historial })
  } catch (error) {
    next(error)
  }
}

export const obtenerTokenLlamada: RequestHandler = async (req, res, next) => {
  try {
    const { llamadaId } = req.params
    const usuarioId = req.usuario?.id
    if (!usuarioId) throw new AppError('Usuario no autenticado', 401)

    const tenantDb = getDb(req)

    const llamada = await llamadasService.obtenerPorId(tenantDb, Number(llamadaId))
    if (!llamada) throw new AppError('Llamada no encontrada', 404)

    if (llamada.estado !== 'activa') {
      // Permitir rejoin si la llamada está vinculada a una reunión activa
      // (ocurre cuando todos salieron pero la reunión sigue programada)
      const puedeRejoin = await llamadasService.esLlamadaDeReunionActiva(tenantDb, Number(llamadaId))
      if (!puedeRejoin) throw new AppError('La llamada no está activa', 400)
      // Reactivar la llamada para permitir rejoin
      await llamadasService.actualizarEstado(tenantDb, Number(llamadaId), 'activa')
    }

    // Verificar acceso: participante de la conversación O invitado a la reunión vinculada
    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      llamada.conversacionId,
      usuarioId
    )

    if (!esParticipante) {
      // Comprobar si el usuario tiene invitación a una reunión asociada a esta llamada
      const [invitacion] = await tenantDb
        .select({ id: invitacionesReunion.id })
        .from(invitacionesReunion)
        .innerJoin(reuniones, eq(reuniones.id, invitacionesReunion.reunionId))
        .where(
          and(
            eq(reuniones.llamadaId, Number(llamadaId)),
            eq(invitacionesReunion.usuarioId, usuarioId)
          )
        )
        .limit(1)

      if (!invitacion) throw new AppError('No tienes acceso', 403)
    }

    const user = await llamadasService.obtenerUsuario(tenantDb, usuarioId)
    if (!user) throw new AppError('Usuario no encontrado', 404)

    const token = await llamadasService.generateToken(
      llamada.livekitRoom,
      usuarioId,
      user.nombreCompleto
    )

    res.json({
      success: true,
      data: {
        token,
        livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
        roomName: llamada.livekitRoom,
      },
    })
  } catch (error) {
    next(error)
  }
}
