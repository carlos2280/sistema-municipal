import type { Request, RequestHandler } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { AppError } from '../libs/middleware/AppError.js'
import { conversacionesService } from '../services/conversaciones.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

export const obtenerConversaciones: RequestHandler = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id
    if (!usuarioId) {
      throw new AppError('Usuario no autenticado', 401)
    }

    const tenantDb = getDb(req)

    const conversaciones =
      await conversacionesService.obtenerConversacionesPorUsuario(tenantDb, usuarioId)

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

    const tenantDb = getDb(req)

    const conversacion = await conversacionesService.obtenerConversacionPorId(
      tenantDb,
      Number(id)
    )

    if (!conversacion) {
      throw new AppError('Conversación no encontrada', 404)
    }

    // Verificar que el usuario es participante
    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      Number(id),
      usuarioId
    )

    if (!esParticipante) {
      throw new AppError('No tienes acceso a esta conversación', 403)
    }

    const participantes = await conversacionesService.obtenerParticipantes(
      tenantDb,
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

    const tenantDb = getDb(req)

    const conversacion = await conversacionesService.crearConversacionDirecta(
      tenantDb,
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

    const tenantDb = getDb(req)

    const grupo = await conversacionesService.crearConversacion(
      tenantDb,
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

export const obtenerParticipantesConUsuario: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params
    const usuarioId = req.usuario?.id
    if (!usuarioId) throw new AppError('Usuario no autenticado', 401)

    const tenantDb = getDb(req)

    const esParticipante = await conversacionesService.verificarParticipante(
      tenantDb,
      Number(id),
      usuarioId
    )
    if (!esParticipante) throw new AppError('No tienes acceso a esta conversación', 403)

    const participantes =
      await conversacionesService.obtenerParticipantesConUsuario(tenantDb, Number(id))

    res.json({ success: true, data: participantes })
  } catch (error) {
    next(error)
  }
}

export const agregarParticipante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const { usuarioId: nuevoUsuarioId } = req.body
    const solicitanteId = req.usuario?.id
    if (!solicitanteId) throw new AppError('Usuario no autenticado', 401)
    if (!nuevoUsuarioId) throw new AppError('ID del usuario requerido', 400)

    const tenantDb = getDb(req)

    const result = await conversacionesService.agregarParticipante(
      tenantDb,
      Number(id),
      nuevoUsuarioId,
      solicitanteId
    )

    if (!result.success) throw new AppError(result.error!, 400)

    res.json({ success: true, message: 'Participante agregado' })
  } catch (error) {
    next(error)
  }
}

export const eliminarParticipante: RequestHandler = async (req, res, next) => {
  try {
    const { id, usuarioId: targetId } = req.params
    const solicitanteId = req.usuario?.id
    if (!solicitanteId) throw new AppError('Usuario no autenticado', 401)

    const tenantDb = getDb(req)

    const result = await conversacionesService.eliminarParticipante(
      tenantDb,
      Number(id),
      Number(targetId),
      solicitanteId
    )

    if (!result.success) throw new AppError(result.error!, 400)

    res.json({ success: true, message: 'Participante eliminado' })
  } catch (error) {
    next(error)
  }
}

export const renombrarGrupo: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const { nombre } = req.body
    const solicitanteId = req.usuario?.id
    if (!solicitanteId) throw new AppError('Usuario no autenticado', 401)
    if (!nombre?.trim()) throw new AppError('Nombre requerido', 400)

    const tenantDb = getDb(req)

    const result = await conversacionesService.renombrarGrupo(
      tenantDb,
      Number(id),
      nombre,
      solicitanteId
    )

    if (!result.success) throw new AppError(result.error!, 400)

    res.json({ success: true, message: 'Grupo renombrado' })
  } catch (error) {
    next(error)
  }
}
