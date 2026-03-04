import { db } from "@/app";
import type { DbClient } from "@/db/client";
import * as orgService from "@services/organigrama.service";
import type { RequestHandler } from "express";

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const getOrganigrama: RequestHandler = async (req, res, next) => {
  try {
    const data = await orgService.getOrganigrama(getDb(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
