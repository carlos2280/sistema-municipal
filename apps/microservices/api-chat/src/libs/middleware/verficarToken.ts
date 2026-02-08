import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from './AppError.js'

interface TokenPayload {
  userId: number
  email: string
  iat: number
  exp: number
}

export const verificarToken: RequestHandler = (req, _res, next) => {
  try {
    let token: string | undefined

    // 1. Intentar obtener de header Authorization
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // 2. Si no hay header, buscar en cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) {
      throw new AppError('Token no proporcionado', 401)
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload

    req.usuario = {
      id: decoded.userId,
      email: decoded.email,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido', 401))
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expirado', 401))
      return
    }
    next(error)
  }
}
