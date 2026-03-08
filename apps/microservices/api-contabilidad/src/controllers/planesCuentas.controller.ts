import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express";
import * as pcService from "../services/planesCuentas.service";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const crearPlanesCuenta: RequestHandler = async (req, res, next) => {
    try {
        const nuevo = await pcService.crearPlanesCuenta(getDb(req), req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        next(error);
    }
};

export const obtenerPlanesCuentas: RequestHandler = async (req, res, next) => {
    try {
        const lista = await pcService.obtenerPlanesCuentas(getDb(req));
        res.status(200).json(lista);
    } catch (error) {
        next(error);
    }
};

export const obtenerPlanesCuentaPorId: RequestHandler = async (
    req,
    res,
    next,
) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        const item = await pcService.obtenerPlanesCuentaPorId(getDb(req), id);
        if (!item) {
            return next(new AppError("Cuenta no encontrada", 404));
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

export const actualizarPlanesCuenta: RequestHandler = async (
    req,
    res,
    next,
) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        const updated = await pcService.actualizarPlanesCuenta(getDb(req), id, req.body);
        if (!updated) {
            return next(new AppError("Cuenta no encontrada", 404));
        }
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const eliminarPlanesCuenta: RequestHandler = async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        await pcService.eliminarPlanesCuenta(getDb(req), id);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

export const obtenerArbolPlanes: RequestHandler = async (req, res, next) => {
    try {
        const tree = await pcService.obtenerArbolPlanes(getDb(req));
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

export const obtenerArbolCompleto: RequestHandler = async (req, res, next) => {
    try {
        const tree = await pcService.obtenerArbolCompleto(getDb(req));
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

export const buscarCuentasPorPrefijo: RequestHandler = async (req, res, next) => {
    const { prefijo } = req.query;

    if (!prefijo || typeof prefijo !== "string") {
        return next(new AppError("Parametro prefijo es requerido", 400));
    }

    try {
        const result = await pcService.buscarCuentasPorPrefijo(getDb(req), prefijo);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const verificarCodigoExiste: RequestHandler = async (req, res, next) => {
    const { anoContable, codigo } = req.query;

    if (!anoContable || !codigo) {
        return next(new AppError("Parámetros anoContable y codigo son requeridos", 400));
    }

    const ano = Number(anoContable);
    if (!Number.isInteger(ano)) {
        return next(new AppError("anoContable debe ser un número válido", 400));
    }

    try {
        const result = await pcService.verificarCodigoExiste(getDb(req), ano, String(codigo));
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
