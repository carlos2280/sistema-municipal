import { AppError } from "@/libs/middleware/AppError";
import * as tenantService from "@services/tenant.service";
import type { RequestHandler } from "express";

/**
 * GET /api/v1/tenant/transversal-db
 * Headers requeridos: x-tenant-id (inyectado por el gateway)
 *
 * Retorna el nombre de la DB transversal del tenant.
 * Usado internamente por api-gateway para inyectar x-transversal-db-name.
 */
export const getTenantTransversalDb: RequestHandler = async (req, res, next) => {
  try {
    const tenantIdHeader = req.headers["x-tenant-id"] as string | undefined;

    if (!tenantIdHeader) {
      return next(new AppError("Tenant no identificado", 401));
    }

    const tenantId = Number(tenantIdHeader);
    if (Number.isNaN(tenantId) || tenantId <= 0) {
      return next(new AppError("Tenant ID inválido", 400));
    }

    const info = await tenantService.getTransversalDbName(tenantId);

    if (!info) {
      return next(new AppError("Municipalidad no encontrada", 404));
    }

    res.status(200).json(info);
  } catch (error) {
    next(error);
  }
};
