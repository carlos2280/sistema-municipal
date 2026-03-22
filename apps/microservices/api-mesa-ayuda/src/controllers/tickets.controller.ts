import { getDB } from '@/db/client'
import { AppError } from '@/libs/middleware/AppError'
import { ticketFiltersSchema } from '@/libs/schemas/tickets.schemas'
import * as ticketsService from '@/services/tickets.service'
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
    const filters = ticketFiltersSchema.parse(req.query)
    const result = await ticketsService.listarTickets(
      getDB(),
      user.tenantId,
      filters,
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const id = Number(req.params.id)
    const ticket = await ticketsService.obtenerTicket(
      getDB(),
      user.tenantId,
      id,
    )
    res.json(ticket)
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const ticket = await ticketsService.crearTicket(
      getDB(),
      user.tenantId,
      req.body,
      user,
    )
    res.status(201).json(ticket)
  } catch (err) {
    next(err)
  }
}

export async function actualizar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireUser(req)
    const id = Number(req.params.id)
    const ticket = await ticketsService.actualizarTicket(
      getDB(),
      user.tenantId,
      id,
      req.body,
    )
    res.json(ticket)
  } catch (err) {
    next(err)
  }
}

export async function cambiarEstado(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireUser(req)
    const id = Number(req.params.id)
    const ticket = await ticketsService.cambiarEstado(
      getDB(),
      user.tenantId,
      id,
      req.body,
      user.id,
    )
    res.json(ticket)
  } catch (err) {
    next(err)
  }
}

export async function asignar(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const id = Number(req.params.id)
    const ticket = await ticketsService.asignarTicket(
      getDB(),
      user.tenantId,
      id,
      req.body,
    )
    res.json(ticket)
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
    const id = Number(req.params.id)
    await ticketsService.eliminarTicket(getDB(), user.tenantId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req)
    const result = await ticketsService.obtenerStats(getDB(), user.tenantId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
