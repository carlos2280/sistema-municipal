import { AppError } from "@/libs/middleware/AppError";
import * as modulesService from "@services/modules.service";
import type { RequestHandler } from "express";

export const getTenantModules: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = req.headers["x-tenant-slug"] as string;

    if (!tenantSlug) {
      return next(new AppError("Tenant no identificado", 401));
    }

    const modules = await modulesService.getActiveModules(tenantSlug);
    res.status(200).json(modules);
  } catch (error) {
    next(error);
  }
};
