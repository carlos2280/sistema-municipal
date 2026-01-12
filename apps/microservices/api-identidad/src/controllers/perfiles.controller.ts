import type { NewArea } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as perfilesService from "@services/perfiles.service";
import type { RequestHandler } from "express";

export const createPerfil: RequestHandler = async (req, res, next) => {
  try {
    const newArea = req.body as NewArea;
    const data = await perfilesService.createPerfil(newArea);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllPerfiles: RequestHandler = async (req, res, next) => {
  try {
    const data = await perfilesService.getAllPerfiles();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPerfilById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.perfilId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await perfilesService.getPerfilById(id);
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
    const data = await perfilesService.updatePerfil(id, req.body);
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
    const data = await perfilesService.deletePerfil(id);
    if (!data) return next(new AppError("Perfil no encontrado", 404));
    res.status(200).json({ message: "perfil eliminado", data });
  } catch (error) {
    next(error);
  }
};
