import type { RequestHandler } from 'express'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'

export const obtenerConversaciones: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id
    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    const conversaciones =
      await conversacionesService.obtenerConversacionesPorUsuario(usuarioId)

    res.json({
      success: true,
      data: conversaciones,
    })
  } catch (error) {
    next(error)
  }
}

export const obtenerConversacion: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    const conversacion = await conversacionesService.obtenerConversacionPorId(
      Number(id)
    )

    if (!conversacion) {
      throw new AppError('Conversación no encontrada', 404)
    }

    // Verificar que el usuario es participante
    const esParticipante = await conversacionesService.verificarParticipante(
      Number(id),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const participantes = await conversacionesService.obtenerParticipantes(
      Number(id)
    )

    res.json({
      success: true,
      data: { ...conversacion, participantes },
    })
  } catch (error) {
    next(error)
  }
}

export const crearConversacionDirecta: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const usuarioId = req.usuario?.id
    const { destinatarioId } = req.body

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    if (!destinatarioId) {
      throw new AppError('Destinatario requerido', 400)
    }

    const conversacion = await conversacionesService.crearConversacionDirecta(
      usuarioId,
      destinatarioId
    )

    res.status(201).json({
      success: true,
      data: conversacion,
    })
  } catch (error) {
    next(error)
  }
}

export const crearGrupo: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id
    const { nombre, descripcion, participantes } = req.body

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    if (!nombre) {
      throw new AppError('Nombre del grupo requerido', 400)
    }

    const allParticipantes = [
      usuarioId,
      ...(participantes || []).filter((id: number) => id !== usuarioId),
    ]

    const grupo = await conversacionesService.crearConversacion(
      {
        tipo: 'grupo',
        nombre,
        descripcion,
        creadorId: usuarioId,
      },
      allParticipantes
    )

    res.status(201).json({
      success: true,
      data: grupo,
    })
  } catch (error) {
    next(error)
  }
}
