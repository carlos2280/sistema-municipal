import type { Request, RequestHandler } from 'express'
import { db } from '../db/client.js'
import type { DbClient } from '../db/client.js'
import { gruposSistemaService } from '../services/gruposSistema.service.js'

/** Obtiene la instancia de DB del tenant o la por defecto */
const getDb = (req: Request) => (req.tenantDb ?? db) as DbClient

/**
 * Extrae el nombre de la DB del tenant del header inyectado por el gateway.
 * Se pasa a api-identidad para que resuelva el organigrama del tenant correcto.
 */
const getDbName = (req: Request): string =>
  (req.headers['x-tenant-db-name'] as string | undefined) ?? 'transversal'

export const sincronizarGruposSistema: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const tenantDb = getDb(req)
    const dbName = getDbName(req)
    const result = await gruposSistemaService.sincronizarGrupos(
      tenantDb,
      dbName,
    )

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
