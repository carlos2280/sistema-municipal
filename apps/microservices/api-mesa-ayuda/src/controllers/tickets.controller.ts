import { getDB } from '@/db/client'
import { ticketFiltersSchema } from '@/libs/schemas/tickets.schemas'
import * as ticketsService from '@/services/tickets.service'
import type { NextFunction, Request, Response } from 'express'

function getUserInfo(req: Request) {
  return {
    id: Number(req.headers['x-user-id']) || 1,
    nombre: (req.headers['x-user-nombre'] as string) || 'Usuario Dev',
    email: (req.headers['x-user-email'] as string) || undefined,
    tenantId: Number(req.headers['x-tenant-id']) || 0,
  }
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = ticketFiltersSchema.parse(req.query)
    const { tenantId } = getUserInfo(req)
    const result = await ticketsService.listarTickets(
      getDB(),
      tenantId,
      filters,
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { tenantId } = getUserInfo(req)
    const ticket = await ticketsService.obtenerTicket(getDB(), tenantId, id)
    res.json(ticket)
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserInfo(req)
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
    const id = Number(req.params.id)
    const { tenantId } = getUserInfo(req)
    const ticket = await ticketsService.actualizarTicket(
      getDB(),
      tenantId,
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
    const id = Number(req.params.id)
    const user = getUserInfo(req)
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
    const id = Number(req.params.id)
    const { tenantId } = getUserInfo(req)
    const ticket = await ticketsService.asignarTicket(
      getDB(),
      tenantId,
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
    const id = Number(req.params.id)
    const { tenantId } = getUserInfo(req)
    await ticketsService.eliminarTicket(getDB(), tenantId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = getUserInfo(req)
    const result = await ticketsService.obtenerStats(getDB(), tenantId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
