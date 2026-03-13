import { db } from "@/app";
import type { DbClient } from "@/db/client";
import type { NewUsuario } from "@municipal/db-identidad";
import { AppError } from "@/libs/middleware/AppError";
import * as usuarioService from "@services/usuarios.service";
import type { RequestHandler } from "express";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const getAllUsuarios: RequestHandler = async (req, res, next) => {
  try {
    const data = await usuarioService.getAllUsuarios(getDb(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.usuarioId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await usuarioService.getUsuarioById(getDb(req), id);
    if (!data) return next(new AppError("Usuario no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createUsuario: RequestHandler = async (req, res, next) => {
  try {
    const newUsuario = req.body as NewUsuario;
    const data = await usuarioService.createUsuario(getDb(req), newUsuario);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateUsuario: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.usuarioId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await usuarioService.updateUsuario(getDb(req), id, req.body);
    if (!data) return next(new AppError("Usuario no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.usuarioId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await usuarioService.deleteUsuario(getDb(req), id);
    if (!data) return next(new AppError("Usuario no encontrado", 404));
    res.status(200).json({ message: "Usuario eliminado", data });
  } catch (error) {
    next(error);
  }
};
