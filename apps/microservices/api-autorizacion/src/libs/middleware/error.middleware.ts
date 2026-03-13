import type { NextFunction, Request, Response } from "express";
import { createLogger } from "@municipal/core/logger";
import { AppError } from "./AppError";

const logger = createLogger("api-autorizacion:error");

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = (req.headers["x-request-id"] as string) ?? "unknown";
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: `HTTP_${err.statusCode}`,
      message: err.message,
      requestId,
      timestamp,
    });
    return;
  }

  logger.error({ err, requestId }, "Error no manejado");
  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
    requestId,
    timestamp,
  });
};
