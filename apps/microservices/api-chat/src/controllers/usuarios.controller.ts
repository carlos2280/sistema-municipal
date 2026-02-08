import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../libs/middleware/AppError.js'
import { usuariosService } from '../services/usuarios.service.js'

export const usuariosController = {
  async buscarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const { q = '', limit = '20' } = req.query
      const usuarioActualId = req.usuario?.id

      if (!usuarioActualId) {
        throw new AppError('Usuario no autenticado', 401)
      }

      const usuarios = await usuariosService.buscarUsuarios(
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
