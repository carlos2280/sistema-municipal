import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express";
import * as csService from "../services/cuentasSubgrupos.service";


export const crearCuentasSubgrupo: RequestHandler = async (req, res, next) => {
    try {
        const nuevo = await csService.crearCuentasSubgrupo(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        next(error);
    }
};

export const obtenerCuentasSubgrupos: RequestHandler = async (_, res, next) => {
    try {
        const lista = await csService.obtenerCuentasSubgrupos();
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
        const item = await csService.obtenerCuentasSubgrupoPorId(id);
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
        const updated = await csService.actualizarCuentasSubgrupo(id, req.body);
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
        await csService.eliminarCuentasSubgrupo(id);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

export const obtenerArbolSubgrupos: RequestHandler = async (_, res, next) => {
    try {
        const tree = await csService.obtenerArbolSubgrupos();
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};
