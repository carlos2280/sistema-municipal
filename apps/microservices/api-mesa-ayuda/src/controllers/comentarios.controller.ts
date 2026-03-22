import { getDB } from '@/db/client'
import { AppError } from '@/libs/middleware/AppError'
import * as comentariosService from '@/services/comentarios.service'
import type { NextFunction, Request, Response } from 'express'

function requireUser(req: Request) {
  const user = req.gatewayUser
  if (!user) {
    throw new AppError('Usuario no autenticado', 401)
  }
  return user
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const ticketId = Number(req.params.id)
    const result = await comentariosService.listarComentarios(
      getDB(),
      user.tenantId,
      ticketId,
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const ticketId = Number(req.params.id)
    const comentario = await comentariosService.agregarComentario(
      getDB(),
      user.tenantId,
      ticketId,
      req.body,
      { id: user.id, nombre: user.nombre },
    )
    res.status(201).json(comentario)
  } catch (err) {
    next(err)
  }
}

export async function eliminar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireUser(req)
    const ticketId = Number(req.params.id)
    const comentarioId = Number(req.params.cid)
    await comentariosService.eliminarComentario(
      getDB(),
      ticketId,
      comentarioId,
      user.id,
    )
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
