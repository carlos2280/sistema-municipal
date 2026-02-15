import type { RequestHandler } from 'express'
import { gruposSistemaService } from '../services/gruposSistema.service.js'

export const sincronizarGruposSistema: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const result = await gruposSistemaService.sincronizarGrupos()

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
