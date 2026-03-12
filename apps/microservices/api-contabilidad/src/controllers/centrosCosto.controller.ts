import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express";
import * as ccService from "../services/centrosCosto.service";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const obtenerCentrosCosto: RequestHandler = async (req, res, next) => {
  try {
    const soloActivos = req.query.todos !== "true";
    const lista = await ccService.obtenerCentrosCosto(getDb(req), soloActivos);
    res.status(200).json(lista);
  } catch (error) {
    next(error);
  }
};

export const crearCentroCosto: RequestHandler = async (req, res, next) => {
  try {
    const nuevo = await ccService.crearCentroCosto(getDb(req), req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

export const actualizarCentroCosto: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    const updated = await ccService.actualizarCentroCosto(getDb(req), id, req.body);
    if (!updated) return next(new AppError("Centro de costo no encontrado", 404));
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const eliminarCentroCosto: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    await ccService.eliminarCentroCosto(getDb(req), id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
