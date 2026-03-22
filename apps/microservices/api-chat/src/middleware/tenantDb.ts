import { createLogger } from '@municipal/core/logger'
import type { NextFunction, Request, Response } from 'express'
import { createTenantDbClient, db } from '../db/client.js'

const logger = createLogger('api-chat:tenantDb')

/**
 * Middleware multi-tenant para api-chat.
 *
 * Lee el header `x-transversal-db-name` inyectado por el gateway tras resolver
 * la municipalidad del JWT. Crea (o reutiliza vía getTenantPool) un cliente
 * Drizzle apuntando a la DB transversal del tenant y lo expone como `req.tenantDb`.
 *
 * Si el header no está presente (acceso directo en desarrollo o backward compat)
 * se deja `req.tenantDb` apuntando a la DB transversal por defecto.
 */
export const tenantDbMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const transversalDbName = req.headers['x-transversal-db-name']

  if (
    typeof transversalDbName === 'string' &&
    transversalDbName.trim() !== ''
  ) {
    logger.debug(
      { transversalDbName },
      'Conectando a DB transversal del tenant',
    )
    req.tenantDb = createTenantDbClient(transversalDbName.trim())
  } else {
    // Sin header → DB transversal por defecto (desarrollo / backward compat)
    req.tenantDb = db
  }

  next()
}
