import { AppError } from "@/libs/middleware/AppError";
import {
  agregarComentarioSchema,
  asignarTicketSchema,
  cambiarCategoriaSchema,
  cambiarEstadoSchema,
  cambiarPrioridadSchema,
  createCategoriaSchema,
  ticketFiltersSchema,
  updateCategoriaSchema,
  updatePrioridadSchema,
} from "@/libs/schemas/mesaAyuda.schemas";
import * as mesaAyudaService from "@services/admin/mesaAyuda.service";
import type { RequestHandler } from "express";

// ─── Dashboard y monitoreo ────────────────────────────────────────────────────

export const getDashboard: RequestHandler = async (_req, res, next) => {
  try {
    const dashboard = await mesaAyudaService.getDashboard();
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
};

export const getSlaMonitoreo: RequestHandler = async (_req, res, next) => {
  try {
    const sla = await mesaAyudaService.getSlaMonitoreo();
    res.json(sla);
  } catch (err) {
    next(err);
  }
};

// ─── Tickets — lectura ────────────────────────────────────────────────────────

export const getTickets: RequestHandler = async (req, res, next) => {
  try {
    const parsed = ticketFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Parámetros de filtro inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const result = await mesaAyudaService.getTickets(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTicketDetail: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const id = Number(req.params.ticketId);
    if (Number.isNaN(id)) {
      return next(new AppError("ID de ticket inválido", 400));
    }
    const detail = await mesaAyudaService.getTicketDetail(tenantSlug, id);
    res.json(detail);
  } catch (err) {
    next(err);
  }
};

// ─── Tickets — gestión operativa ─────────────────────────────────────────────

export const cambiarEstado: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const ticketId = Number(req.params.ticketId);
    if (Number.isNaN(ticketId)) {
      return next(new AppError("ID de ticket inválido", 400));
    }

    const parsed = cambiarEstadoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // TODO: cuando haya autenticación, obtener userId del token
    const ejecutadoPor = 1;

    await mesaAyudaService.cambiarEstado(
      tenantSlug,
      ticketId,
      parsed.data,
      ejecutadoPor,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const asignarTicket: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const ticketId = Number(req.params.ticketId);
    if (Number.isNaN(ticketId)) {
      return next(new AppError("ID de ticket inválido", 400));
    }

    const parsed = asignarTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    await mesaAyudaService.asignarTicket(tenantSlug, ticketId, parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const cambiarPrioridad: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const ticketId = Number(req.params.ticketId);
    if (Number.isNaN(ticketId)) {
      return next(new AppError("ID de ticket inválido", 400));
    }

    const parsed = cambiarPrioridadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    await mesaAyudaService.cambiarPrioridad(tenantSlug, ticketId, parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const cambiarCategoria: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const ticketId = Number(req.params.ticketId);
    if (Number.isNaN(ticketId)) {
      return next(new AppError("ID de ticket inválido", 400));
    }

    const parsed = cambiarCategoriaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    await mesaAyudaService.cambiarCategoria(tenantSlug, ticketId, parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const agregarComentario: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = String(req.params.tenantSlug);
    const ticketId = Number(req.params.ticketId);
    if (Number.isNaN(ticketId)) {
      return next(new AppError("ID de ticket inválido", 400));
    }

    const parsed = agregarComentarioSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // TODO: cuando haya autenticación, obtener autorId y autorNombre del token
    const autorId = 1;
    const autorNombre = "Admin Platform";

    const comentario = await mesaAyudaService.agregarComentario(
      tenantSlug,
      ticketId,
      parsed.data,
      autorId,
      autorNombre,
    );
    res.status(201).json(comentario);
  } catch (err) {
    next(err);
  }
};

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const getTenantsSummary: RequestHandler = async (_req, res, next) => {
  try {
    const tenants = await mesaAyudaService.getTenantsSummary();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
};

// ─── Categorías ───────────────────────────────────────────────────────────────

export const getCategorias: RequestHandler = async (_req, res, next) => {
  try {
    const result = await mesaAyudaService.getCategorias();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createCategoria: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createCategoriaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const nueva = await mesaAyudaService.createCategoria(parsed.data);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
};

export const updateCategoria: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return next(new AppError("ID de categoría inválido", 400));
    }

    const parsed = updateCategoriaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const updated = await mesaAyudaService.updateCategoria(id, parsed.data);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCategoria: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return next(new AppError("ID de categoría inválido", 400));
    }
    await mesaAyudaService.deleteCategoria(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ─── Prioridades ──────────────────────────────────────────────────────────────

export const getPrioridades: RequestHandler = async (_req, res, next) => {
  try {
    const result = await mesaAyudaService.getPrioridades();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updatePrioridad: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return next(new AppError("ID de prioridad inválido", 400));
    }

    const parsed = updatePrioridadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const updated = await mesaAyudaService.updatePrioridad(id, parsed.data);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
