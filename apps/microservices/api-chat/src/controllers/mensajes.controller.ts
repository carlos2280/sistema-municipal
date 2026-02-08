import type { RequestHandler } from 'express'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'
import { mensajesService } from '../services/mensajes.service.js'

export const obtenerMensajes: RequestHandler = async (req, res, next) => {
  try {
    const { conversacionId } = req.params
    const { cursor } = req.query
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    // Verificar acceso a la conversación
    const esParticipante = await conversacionesService.verificarParticipante(
      Number(conversacionId),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const mensajes = await mensajesService.obtenerMensajes(
      Number(conversacionId),
      cursor ? Number(cursor) : undefined
    )

    res.json({
      success: true,
      data: mensajes,
      nextCursor: mensajes.length > 0 ? mensajes[mensajes.length - 1].id : null,
    })
  } catch (error) {
    next(error)
  }
}

export const crearMensaje: RequestHandler = async (req, res, next) => {
  try {
    const { conversacionId } = req.params
    const { contenido, tipo = 'texto' } = req.body
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    if (!contenido) {
      throw new AppError('Contenido del mensaje requerido', 400)
    }

    // Verificar acceso a la conversación
    const esParticipante = await conversacionesService.verificarParticipante(
      Number(conversacionId),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const mensaje = await mensajesService.crearMensaje({
      conversacionId: Number(conversacionId),
      remitenteId: usuarioId,
      contenido,
      tipo,
    })

    res.status(201).json({
      success: true,
      data: mensaje,
    })
  } catch (error) {
    next(error)
  }
}

export const editarMensaje: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const { contenido } = req.body
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    if (!contenido) {
      throw new AppError('Contenido del mensaje requerido', 400)
    }

    const mensaje = await mensajesService.editarMensaje(
      Number(id),
      contenido,
      usuarioId
    )

    if (!mensaje) {
      throw new AppError('Mensaje no encontrado o sin permisos', 404)
    }

    res.json({
      success: true,
      data: mensaje,
    })
  } catch (error) {
    next(error)
  }
}

export const eliminarMensaje: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    const eliminado = await mensajesService.eliminarMensaje(
      Number(id),
      usuarioId
    )

    if (!eliminado) {
      throw new AppError('Mensaje no encontrado o sin permisos', 404)
    }

    res.json({
      success: true,
      message: 'Mensaje eliminado',
    })
  } catch (error) {
    next(error)
  }
}
