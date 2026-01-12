import type { NewMenu } from "@/db/schema";
import { AppError } from "@/libs/middleware/AppError";
import * as menusService from "@services/menus.service";
import type { RequestHandler } from "express";

export const createMenu: RequestHandler = async (req, res, next) => {
  try {
    const newMenu = req.body as NewMenu;
    const data = await menusService.createMenu(newMenu);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllMenus: RequestHandler = async (req, res, next) => {
  try {
    const data = await menusService.getAllMenus();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMenuById: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.menuId);
  if (Number.isNaN(id)) return next(new AppError("ID inválido", 400));

  try {
    const data = await menusService.getMenuById(id);
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
    const data = await menusService.updateMenu(id, req.body);
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
    const data = await menusService.deleteMenu(id);
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
    const data = await menusService.getMenusBySistema(id);
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
    const data = await menusService.getSubmenus(id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
