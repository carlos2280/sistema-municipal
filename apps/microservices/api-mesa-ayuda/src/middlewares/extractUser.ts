import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

/**
 * Schema de validación de los headers inyectados por el gateway.
 *
 * Mesa de ayuda es centralizada (DB transversal única). No se usa
 * x-transversal-db-name para conmutar conexión — siempre se usa la DB
 * `transversal` fija. El tenantId del header identifica la municipalidad
 * de origen y se aplica como filtro obligatorio en todas las queries.
 */
const gatewayUserSchema = z.object({
  'x-user-id': z.coerce.number().int().positive(),
  'x-user-nombre': z.string().min(1),
  'x-user-email': z.string().email().optional(),
  'x-tenant-id': z.coerce.number().int().nonnegative(),
})

/**
 * Extrae y valida los headers del gateway en req.gatewayUser.
 *
 * En modo desarrollo, inyecta valores de fallback para facilitar
 * pruebas sin pasar por el gateway.
 */
export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.NODE_ENV === 'development') {
    req.gatewayUser = {
      id: Number(req.headers['x-user-id']) || 1,
      nombre: (req.headers['x-user-nombre'] as string) || 'Usuario Dev',
      email: (req.headers['x-user-email'] as string) || undefined,
      tenantId: Number(req.headers['x-tenant-id']) || 0,
    }
    next()
    return
  }

  const parsed = gatewayUserSchema.safeParse(req.headers)

  if (!parsed.success) {
    res.status(401).json({
      message: 'Headers de usuario inválidos o ausentes',
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  req.gatewayUser = {
    id: parsed.data['x-user-id'],
    nombre: parsed.data['x-user-nombre'],
    email: parsed.data['x-user-email'],
    tenantId: parsed.data['x-tenant-id'],
  }

  next()
}
