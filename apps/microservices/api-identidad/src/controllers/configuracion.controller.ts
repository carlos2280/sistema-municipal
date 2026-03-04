import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import * as configuracionService from "@services/configuracion.service";
import type { RequestHandler } from "express";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const getUsuariosMfa: RequestHandler = async (req, res, next) => {
  try {
    const data = await configuracionService.getUsuariosMfaStatus(getDb(req));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const resetMfa: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0) {
    return next(new AppError("ID de usuario inválido", 400));
  }
  try {
    await configuracionService.resetMfaUsuario(getDb(req), id);
    res.status(200).json({ message: "MFA del usuario restablecido correctamente" });
  } catch (error) {
    next(error);
  }
};
