import { db } from "@/app";
import type { DbClient } from "@/db/client";
import type { NewMenu } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as menusService from "@services/menus.service";
import type { RequestHandler } from "express";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const createMenu: RequestHandler = async (req, res, next) => {
  try {
    const newMenu = req.body as NewMenu;
    const data = await menusService.createMenu(getDb(req), newMenu);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllMenus: RequestHandler = async (req, res, next) => {
  try {
    const data = await menusService.getAllMenus(getDb(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMenuById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.menuId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await menusService.getMenuById(getDb(req), id);
    if (!data) return next(new AppError("Menu no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateMenu: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.menuId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await menusService.updateMenu(getDb(req), id, req.body);
    if (!data) return next(new AppError("Menu no encontrado", 404));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteMenu: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.menuId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await menusService.deleteMenu(getDb(req), id);
    if (!data) return next(new AppError("Area no encontrada", 404));
    res.status(200).json({ message: "Menu eliminado", data });
  } catch (error) {
    next(error);
  }
};

// Obtiene todos los menús asociados a un sistema específico
export const getMenusBySistema: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.sistemaId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
  try {
    const data = await menusService.getMenusBySistema(getDb(req), id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Obtiene todos los submenús (menús hijos) de un menú padre
export const getSubmenus: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.padreId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));
  try {
    const data = await menusService.getSubmenus(getDb(req), id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
