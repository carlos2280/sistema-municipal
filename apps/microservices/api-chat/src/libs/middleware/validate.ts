import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

/**
 * Middleware de validación Zod reutilizable.
 * Valida req.body con el schema dado; reemplaza req.body con los datos parseados (coerción incluida).
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: result.error.flatten().fieldErrors,
      })
      return
    }
    req.body = result.data
    next()
  }
