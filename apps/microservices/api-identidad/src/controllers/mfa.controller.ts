import { db } from "@/app";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import * as mfaService from "@services/mfa.service";
import type { RequestHandler } from "express";

// ─── Helper: obtener DB con soporte multi-tenant ─────────────────────────────

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

// ─── Helper: extraer userId del header inyectado por el gateway ──────────────

function getUserId(req: { headers: Record<string, unknown> }): number {
  const raw = req.headers["x-user-id"];
  const id = Number(raw);
  if (!raw || Number.isNaN(id) || id <= 0) {
    throw new AppError("Identidad de usuario no encontrada en la solicitud.", 401);
  }
  return id;
}

function getUserEmail(req: { headers: Record<string, unknown> }): string {
  const email = req.headers["x-user-email"];
  if (!email || typeof email !== "string") {
    throw new AppError("Email de usuario no encontrado en la solicitud.", 401);
  }
  return email;
}

// ─── Controladores ───────────────────────────────────────────────────────────

/**
 * GET /v1/identidad/mfa/status
 * Retorna si el usuario tiene MFA habilitado y verificado.
 */
export const getStatus: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const status = await mfaService.getMfaStatus(getDb(req), userId);
    res.status(200).json({ data: status });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v1/identidad/mfa/setup
 * Genera el secreto TOTP y el QR para que el usuario lo escanee.
 * El secreto queda guardado cifrado en DB (pendiente de confirmar).
 */
export const setup: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const email = getUserEmail(req);
    const result = await mfaService.setupMfa(getDb(req), userId, email);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/identidad/mfa/enable
 * Body: { code: string }
 * Confirma el primer código TOTP y activa MFA.
 * Devuelve los 8 backup codes — ÚNICA vez que se muestran.
 */
export const enable: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { code } = req.body as { code?: string };

    if (!code || typeof code !== "string") {
      throw new AppError("El campo 'code' es requerido.", 400);
    }

    const result = await mfaService.enableMfa(getDb(req), userId, code);
    res.status(200).json({
      data: result,
      message:
        "MFA activado correctamente. Guarde los códigos de respaldo en un lugar seguro — no se mostrarán nuevamente.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/identidad/mfa/verify
 * Body: { userId: number, code?: string, backupCode?: string }
 * Verifica el código TOTP o backup code durante el flujo de login.
 * Este endpoint es invocado por el servicio de autorizacion, no directamente por el usuario.
 * No requiere JWT completo — solo el userId validado previamente por credenciales.
 */
export const verify: RequestHandler = async (req, res, next) => {
  try {
    const { userId, code, backupCode } = req.body as {
      userId?: number;
      code?: string;
      backupCode?: string;
    };

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new AppError("userId inválido.", 400);
    }

    if (!code && !backupCode) {
      throw new AppError(
        "Debe proporcionar 'code' (TOTP) o 'backupCode'.",
        400,
      );
    }

    if (code) {
      await mfaService.verifyMfaCode(getDb(req), userId, code);
    } else if (backupCode) {
      await mfaService.verifyBackupCode(getDb(req), userId, backupCode);
    }

    res.status(200).json({ data: { verified: true } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/identidad/mfa/disable
 * Body: { code: string }
 * Desactiva MFA previa confirmación del código TOTP actual.
 */
export const disable: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { code } = req.body as { code?: string };

    if (!code || typeof code !== "string") {
      throw new AppError("El campo 'code' es requerido.", 400);
    }

    await mfaService.disableMfa(getDb(req), userId, code);
    res.status(200).json({ message: "MFA desactivado correctamente." });
  } catch (error) {
    next(error);
  }
};
