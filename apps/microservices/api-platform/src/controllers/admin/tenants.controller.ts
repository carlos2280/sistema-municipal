import { AppError } from "@/libs/middleware/AppError";
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from "@services/admin/tenants.service";
import * as tenantsService from "@services/admin/tenants.service";
import type { RequestHandler } from "express";

export const listTenants: RequestHandler = async (_req, res, next) => {
  try {
    const tenants = await tenantsService.listTenants();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
};

export const getTenant: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
    const tenant = await tenantsService.getTenantById(id);
    res.json(tenant);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/platform/admin/tenants
 *
 * Body validado por Zod (createTenantSchema) antes de llegar aquí.
 * Crea la municipalidad y provisiona su DB transversal (mensajeria + catálogos).
 */
export const createTenant: RequestHandler = async (req, res, next) => {
  try {
    const input = req.body as CreateTenantInput;
    const tenant = await tenantsService.createTenant(input);
    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
};

export const updateTenant: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
    const input = req.body as UpdateTenantInput;
    const updated = await tenantsService.updateTenant(id, input);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deactivateTenant: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
    await tenantsService.deactivateTenant(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
