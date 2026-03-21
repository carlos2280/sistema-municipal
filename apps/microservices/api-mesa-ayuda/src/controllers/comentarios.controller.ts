import { getDB } from "@/db/client";
import * as comentariosService from "@/services/comentarios.service";
import type { NextFunction, Request, Response } from "express";

function getUserInfo(req: Request) {
  return {
    id: Number(req.headers["x-user-id"]) || 1,
    nombre: (req.headers["x-user-nombre"] as string) || "Usuario Dev",
  };
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const ticketId = Number(req.params.id);
    const result = await comentariosService.listarComentarios(getDB(), ticketId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const ticketId = Number(req.params.id);
    const user = getUserInfo(req);
    const comentario = await comentariosService.agregarComentario(
      getDB(),
      ticketId,
      req.body,
      user,
    );
    res.status(201).json(comentario);
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const ticketId = Number(req.params.id);
    const comentarioId = Number(req.params.cid);
    const user = getUserInfo(req);
    await comentariosService.eliminarComentario(getDB(), ticketId, comentarioId, user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
