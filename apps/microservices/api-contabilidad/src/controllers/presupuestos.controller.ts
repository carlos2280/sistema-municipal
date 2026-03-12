import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express";
import * as pService from "../services/presupuestos.service";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

// ─── Presupuestos ─────────────────────────────────────────────────────────────

export const listarPresupuestos: RequestHandler = async (req, res, next) => {
  try {
    const ano = req.query.ano ? Number(req.query.ano) : undefined;
    const lista = await pService.listarPresupuestos(getDb(req), ano);
    res.status(200).json(lista);
  } catch (error) {
    next(error);
  }
};

export const obtenerPresupuesto: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    const { presupuesto, detalle } = await pService.obtenerPresupuestoConDetalle(getDb(req), id);
    if (!presupuesto) return next(new AppError("Presupuesto no encontrado", 404));
    res.status(200).json({ ...presupuesto, detalle });
  } catch (error) {
    next(error);
  }
};

export const crearPresupuesto: RequestHandler = async (req, res, next) => {
  try {
    const nuevo = await pService.crearPresupuesto(getDb(req), req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

export const actualizarPresupuesto: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    const updated = await pService.actualizarPresupuesto(getDb(req), id, req.body);
    if (!updated) return next(new AppError("Presupuesto no encontrado", 404));
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const eliminarPresupuesto: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    await pService.eliminarPresupuesto(getDb(req), id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// ─── Detalle ─────────────────────────────────────────────────────────────────

export const agregarLinea: RequestHandler = async (req, res, next) => {
  const presupuestoId = Number(req.params.id);
  if (!Number.isInteger(presupuestoId)) return next(new AppError("ID inválido", 400));
  try {
    const linea = await pService.agregarLinea(getDb(req), presupuestoId, req.body);
    res.status(201).json(linea);
  } catch (error) {
    next(error);
  }
};

export const actualizarLinea: RequestHandler = async (req, res, next) => {
  const presupuestoId = Number(req.params.id);
  const detalleId = Number(req.params.detalleId);
  if (!Number.isInteger(presupuestoId) || !Number.isInteger(detalleId))
    return next(new AppError("ID inválido", 400));
  try {
    const updated = await pService.actualizarLinea(getDb(req), presupuestoId, detalleId, req.body);
    if (!updated) return next(new AppError("Línea no encontrada", 404));
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const eliminarLinea: RequestHandler = async (req, res, next) => {
  const presupuestoId = Number(req.params.id);
  const detalleId = Number(req.params.detalleId);
  if (!Number.isInteger(presupuestoId) || !Number.isInteger(detalleId))
    return next(new AppError("ID inválido", 400));
  try {
    await pService.eliminarLinea(getDb(req), presupuestoId, detalleId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// ─── Equilibrio ───────────────────────────────────────────────────────────────

export const calcularEquilibrio: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError("ID inválido", 400));
  try {
    const result = await pService.calcularEquilibrio(getDb(req), id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ─── Cuentas Presupuestarias ──────────────────────────────────────────────────

export const listarCuentasPresupuestarias: RequestHandler = async (req, res, next) => {
  const tipo = req.query.tipo as "ingreso" | "gasto" | undefined;
  if (!tipo || !["ingreso", "gasto"].includes(tipo)) {
    return next(new AppError("Parámetro 'tipo' requerido: ingreso | gasto", 400));
  }
  try {
    const prefijoPadre = req.query.parent as string | undefined;
    const ano = req.query.ano ? Number(req.query.ano) : undefined;
    const cuentas = await pService.listarCuentasPresupuestarias(getDb(req), tipo, prefijoPadre, ano);
    res.status(200).json(cuentas);
  } catch (error) {
    next(error);
  }
};
