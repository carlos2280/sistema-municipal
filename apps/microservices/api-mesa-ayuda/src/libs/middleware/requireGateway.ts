import { GATEWAY_SIGNATURE, X_USER_HEADERS } from '@municipal/core/auth'
import type { NextFunction, Request, Response } from 'express'

export const requireGateway = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV === 'development') {
    next()
    return
  }

  if (req.path.endsWith('/health')) {
    next()
    return
  }

  const secured = req.headers[X_USER_HEADERS.secured]
  if (secured !== GATEWAY_SIGNATURE) {
    res.status(403).json({ message: 'Acceso directo no permitido' })
    return
  }

  next()
}
