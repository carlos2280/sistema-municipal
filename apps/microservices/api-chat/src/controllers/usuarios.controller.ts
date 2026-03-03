import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { AppError } from '../libs/middleware/AppError.js'
import { usuariosService } from '../services/usuarios.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

export const usuariosController = {
  async buscarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const { q = '', limit = '20' } = req.query
      const usuarioActualId = req.usuario?.id

      if (!usuarioActualId) {
        throw new AppError('Usuario no autenticado', 401)
      }

      const tenantDb = getDb(req)

      const usuarios = await usuariosService.buscarUsuarios(
        tenantDb,
        q as string,
        usuarioActualId,
        Number.parseInt(limit as string, 10)
      )

      res.json({
        success: true,
        data: usuarios,
      })
    } catch (error) {
      next(error)
    }
  },
}
