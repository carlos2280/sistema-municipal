import { AppError } from "@/libs/middleware/AppError";
import * as subscriptionsService from "@services/admin/subscriptions.service";
import type { RequestHandler } from "express";

const VALID_ESTADOS = ["activa", "trial", "suspendida", "cancelada"];

export const listSubscriptions: RequestHandler = async (req, res, next) => {
  try {
    const tenantId = Number(req.query.tenantId);
    if (Number.isNaN(tenantId))
      return next(new AppError("tenantId es requerido", 400));
    const subs = await subscriptionsService.listSubscriptions(tenantId);
    res.json(subs);
  } catch (err) {
    next(err);
  }
};

export const createSubscription: RequestHandler = async (req, res, next) => {
  try {
    const {
      tenantId,
      moduloId,
      estado,
      fechaFin,
      precioMensual,
      notas,
      activadoPor,
    } = req.body;

    if (!tenantId || !moduloId || !activadoPor) {
      return next(
        new AppError("tenantId, moduloId y activadoPor son requeridos", 400),
      );
    }

    const sub = await subscriptionsService.createSubscription({
      tenantId: Number(tenantId),
      moduloId: Number(moduloId),
      estado,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      precioMensual,
      notas,
      activadoPor,
    });

    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
};

export const updateSubscriptionEstado: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

    const { estado, motivo, ejecutadoPor } = req.body;

    if (!estado || !ejecutadoPor) {
      return next(
        new AppError("estado y ejecutadoPor son requeridos", 400),
      );
    }

    if (!VALID_ESTADOS.includes(estado)) {
      return next(
        new AppError(
          `estado debe ser uno de: ${VALID_ESTADOS.join(", ")}`,
          400,
        ),
      );
    }

    const updated = await subscriptionsService.updateSubscriptionEstado(id, {
      estado,
      motivo,
      ejecutadoPor,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
