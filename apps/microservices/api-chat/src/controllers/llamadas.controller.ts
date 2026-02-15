import type { RequestHandler } from 'express'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'
import { llamadasService } from '../services/llamadas.service.js'

export const obtenerHistorial: RequestHandler = async (req, res, next) => {
  try {
    const { conversacionId } = req.params
    const usuarioId = req.usuario?.id
    if (!usuarioId) throw new AppError('Usuario no autenticado', 401)

    const esParticipante = await conversacionesService.verificarParticipante(
      Number(conversacionId),
      usuarioId
    )
    if (!esParticipante)
      throw new AppError('No tienes acceso a esta conversación', 403)

    const historial = await llamadasService.obtenerHistorial(
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

    const llamada = await llamadasService.obtenerPorId(Number(llamadaId))
    if (!llamada) throw new AppError('Llamada no encontrada', 404)

    if (llamada.estado !== 'activa')
      throw new AppError('La llamada no está activa', 400)

    const esParticipante = await conversacionesService.verificarParticipante(
      llamada.conversacionId,
      usuarioId
    )
    if (!esParticipante) throw new AppError('No tienes acceso', 403)

    const user = await llamadasService.obtenerUsuario(usuarioId)
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
