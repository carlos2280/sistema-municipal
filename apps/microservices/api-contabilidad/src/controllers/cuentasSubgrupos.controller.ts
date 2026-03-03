import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express";
import * as csService from "../services/cuentasSubgrupos.service";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const crearCuentasSubgrupo: RequestHandler = async (req, res, next) => {
    try {
        const nuevo = await csService.crearCuentasSubgrupo(getDb(req), req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        next(error);
    }
};

export const obtenerCuentasSubgrupos: RequestHandler = async (req, res, next) => {
    try {
        const lista = await csService.obtenerCuentasSubgrupos(getDb(req));
        res.status(200).json(lista);
    } catch (error) {
        next(error);
    }
};

export const obtenerCuentasSubgrupoPorId: RequestHandler = async (
    req,
    res,
    next,
) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        const item = await csService.obtenerCuentasSubgrupoPorId(getDb(req), id);
        if (!item) {
            return next(new AppError("Subgrupo no encontrado", 404));
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

export const actualizarCuentasSubgrupo: RequestHandler = async (
    req,
    res,
    next,
) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        const updated = await csService.actualizarCuentasSubgrupo(getDb(req), id, req.body);
        if (!updated) {
            return next(new AppError("Subgrupo no encontrado", 404));
        }
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const eliminarCuentasSubgrupo: RequestHandler = async (
    req,
    res,
    next,
) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return next(new AppError("ID inválido", 400));
    }
    try {
        await csService.eliminarCuentasSubgrupo(getDb(req), id);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

export const obtenerArbolSubgrupos: RequestHandler = async (req, res, next) => {
    try {
        const tree = await csService.obtenerArbolSubgrupos(getDb(req));
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};
