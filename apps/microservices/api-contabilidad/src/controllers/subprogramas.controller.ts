import { db } from "@/app";
import type { DbClient } from "@/db/client";
import type { RequestHandler } from "express";
import * as subService from "../services/subprogramas.service";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const listarSubprogramas: RequestHandler = async (req, res, next) => {
  try {
    const lista = await subService.listarSubprogramasActivos(getDb(req));
    res.status(200).json(lista);
  } catch (error) {
    next(error);
  }
};
