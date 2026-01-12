import type { NewArea } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as areasService from "@services/areas.service";
import type { RequestHandler } from "express";

export const createArea: RequestHandler = async (req, res, next) => {
  try {
    const newArea = req.body as NewArea;
    const data = await areasService.createArea(newArea);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllAreas: RequestHandler = async (req, res, next) => {
  try {
    const data = await areasService.getAllAreas();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAreaById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.areaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await areasService.getAreaById(id);
    if (!data) return next(new AppError("Area no encontrada", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateArea: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.areaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await areasService.updateArea(id, req.body);
    if (!data) return next(new AppError("Area no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteArea: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.areaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await areasService.deleteArea(id);
    if (!data) return next(new AppError("Area no encontrada", 404));
    res.status(200).json({ message: "Area eliminada", data });
  } catch (error) {
    next(error);
  }
};
