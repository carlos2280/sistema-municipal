import type { NextFunction, Request, Response } from "express";
import { getEnv } from "@/config/env";
import { AppError } from "./AppError";

export const requireAdminKey = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const { ADMIN_API_KEY } = getEnv();
  const provided = req.headers["x-admin-key"] as string | undefined;

  if (!provided || provided !== ADMIN_API_KEY) {
    return next(new AppError("Acceso no autorizado", 401));
  }

  next();
};
