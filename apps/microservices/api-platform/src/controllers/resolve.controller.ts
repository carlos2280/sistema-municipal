import { AppError } from "@/libs/middleware/AppError";
import * as resolveService from "@services/resolve.service";
import type { RequestHandler } from "express";

export const resolveHost: RequestHandler = async (req, res, next) => {
  try {
    const host = req.query.host as string;

    if (!host) {
      return next(new AppError("Parametro 'host' es requerido", 400));
    }

    const tenant = await resolveService.resolveByHost(host);

    if (!tenant) {
      return next(new AppError("Municipalidad no encontrada", 404));
    }

    res.status(200).json(tenant);
  } catch (error) {
    next(error);
  }
};
