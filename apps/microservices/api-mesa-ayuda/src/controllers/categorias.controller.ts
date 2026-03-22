import { getDB } from '@/db/client'
import * as categoriasService from '@/services/categorias.service'
import type { NextFunction, Request, Response } from 'express'

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoriasService.listarCategorias(getDB())
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const categoria = await categoriasService.crearCategoria(getDB(), req.body)
    res.status(201).json(categoria)
  } catch (err) {
    next(err)
  }
}

export async function actualizar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id)
    const categoria = await categoriasService.actualizarCategoria(
      getDB(),
      id,
      req.body,
    )
    res.json(categoria)
  } catch (err) {
    next(err)
  }
}

export async function desactivar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id)
    await categoriasService.desactivarCategoria(getDB(), id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
