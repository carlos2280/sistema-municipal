import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Error interno del servidor" });
};
