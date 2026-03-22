import type { NextFunction, Request, Response } from 'express'

/**
 * Middleware de tenant para api-chat.
 *
 * Desde la separación de DB transversal, mensajería vive siempre en la DB
 * `transversal` (configurada via DATABASE_URL_TRANSVERSAL). El header
 * x-tenant-db-name del gateway se preserva en req para uso informativo
 * (ej: logging, identificar municipalidad) pero NO se usa para cambiar
 * la conexión de DB — todas las queries van a transversal.
 */
export const tenantDbMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // No crear tenant DB client — mensajeria siempre vive en transversal.
  // req.tenantDb queda undefined, los controllers usan `db` (transversal).
  next()
}
