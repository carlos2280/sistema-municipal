import type { Request, RequestHandler } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { gruposSistemaService } from '../services/gruposSistema.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

export const sincronizarGruposSistema: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const tenantDb = getDb(req)
    const result = await gruposSistemaService.sincronizarGrupos(tenantDb)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
