import type { Request, RequestHandler } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'
import { mensajesService } from '../services/mensajes.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

export const obtenerMensajes: RequestHandler = async (req, res, next) => {
  try {
    const { conversacionId } = req.params
    const { cursor } = req.query
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    const tenantDb = getDb(req)

    // Verificar acceso a la conversación
    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      Number(conversacionId),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const mensajes = await mensajesService.obtenerMensajes(
      tenantDb,
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

    const tenantDb = getDb(req)

    // Verificar acceso a la conversación
    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      Number(conversacionId),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const mensaje = await mensajesService.crearMensaje(tenantDb, {
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

    const tenantDb = getDb(req)

    const mensaje = await mensajesService.editarMensaje(
      tenantDb,
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

    const tenantDb = getDb(req)

    const eliminado = await mensajesService.eliminarMensaje(
      tenantDb,
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
