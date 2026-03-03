import { AppError } from "@/libs/middleware/AppError";
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

export const createTenant: RequestHandler = async (req, res, next) => {
  try {
    const { nombre, slug, dominioBase, rut, direccion, telefono, emailContacto, maxUsuarios } =
      req.body;

    if (!nombre || !slug || !dominioBase) {
      return next(new AppError("nombre, slug y dominioBase son requeridos", 400));
    }

    const tenant = await tenantsService.createTenant({
      nombre,
      slug,
      dominioBase,
      rut,
      direccion,
      telefono,
      emailContacto,
      maxUsuarios,
    });

    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
};

export const updateTenant: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
    const updated = await tenantsService.updateTenant(id, req.body);
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
