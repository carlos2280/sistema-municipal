import type { NewArea, NewSistema } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as sistemaService from "@services/sistemas.service";
import type { RequestHandler } from "express";

export const createSistema: RequestHandler = async (req, res, next) => {
  try {
    const newSistema = req.body as NewSistema;
    const data = await sistemaService.createSistema(newSistema);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllSistemas: RequestHandler = async (req, res, next) => {
  try {
    console.log("ELLE");
    const data = await sistemaService.getAllSistemas();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getSistemaById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.sistemaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await sistemaService.getSistemaById(id);
    if (!data) return next(new AppError("Sistema no encontrada", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateSistema: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.sistemaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await sistemaService.updateSistema(id, req.body);
    if (!data) return next(new AppError("Sistema no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteSistema: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.sistemaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await sistemaService.deleteSistema(id);
    if (!data) return next(new AppError("Sistema no encontrada", 404));
    res.status(200).json({ message: "Sistema eliminado", data });
  } catch (error) {
    next(error);
  }
};
