import { db } from "@/app";
import type { DbClient } from "@/db/client";
import type { NewArea } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as perfilesService from "@services/perfiles.service";
import type { RequestHandler } from "express";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const createPerfil: RequestHandler = async (req, res, next) => {
  try {
    const newArea = req.body as NewArea;
    const data = await perfilesService.createPerfil(getDb(req), newArea);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllPerfiles: RequestHandler = async (req, res, next) => {
  try {
    const data = await perfilesService.getAllPerfiles(getDb(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPerfilById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.perfilId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await perfilesService.getPerfilById(getDb(req), id);
    if (!data) return next(new AppError("Perfil no encontrada", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const updatePerfil: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.perfilId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await perfilesService.updatePerfil(getDb(req), id, req.body);
    if (!data) return next(new AppError("Perfil no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deletePerfil: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.perfilId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await perfilesService.deletePerfil(getDb(req), id);
    if (!data) return next(new AppError("Perfil no encontrado", 404));
    res.status(200).json({ message: "perfil eliminado", data });
  } catch (error) {
    next(error);
  }
};
