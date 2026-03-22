import { getDB } from '@/db/client'
import { prioridades } from '@municipal/db-mesa-ayuda'
import type { NextFunction, Request, Response } from 'express'

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getDB()
      .select()
      .from(prioridades)
      .orderBy(prioridades.nivel)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
