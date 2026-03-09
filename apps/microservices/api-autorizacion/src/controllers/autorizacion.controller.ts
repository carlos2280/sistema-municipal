import { db } from "@/app";
import { loadEnv } from "@/config/env";
import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express-serve-static-core";
import * as autorizacionService from "../services/autorizacion.service";

const { NODE_ENV } = loadEnv();

const getDb = (req: { tenantDb?: unknown }): DbClient =>
  (req.tenantDb ?? db) as DbClient;

export const obtenerAreasUsuario: RequestHandler = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar credenciales y obtener áreas
    const { usuario, areas } = await autorizacionService.obtenerAreasUsuario(
      getDb(req),
      correo,
      contrasena,
    );

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new AppError("Cuenta desactivada", 403);
    }

    // if (usuario.passwordTemp) {
    //   res.status(200).json({
    //     usuario,
    //     // requiereCambioPassword: true,
    //   }); return;
    // }

    res.status(200).json(areas);
  } catch (error) {
    next(error);
  }
};

export const obtenerSistemasPorAreaUsuario: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { correo, contrasena, areaId } = req.body;
    // const { areaId, usuarioId } = req.query;
    // Convertir a número ya que query params vienen como strings
    const areaIdNum = Number(areaId);
    // const usuarioIdNum = Number(usuarioId);

    // Validar que sean números válidos
    if (Number.isNaN(areaIdNum)) return next(new AppError("ID inválido", 400));
    // if (Number.isNaN(usuarioIdNum)) return next(new AppError("ID inválido", 400));
    // Validar credenciales y obtener áreas
    const data = await autorizacionService.obtenerSistemasPorAreaUsuario(
      getDb(req),
      correo,
      contrasena,
      areaIdNum,
    );

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const obtenerMisSistemas: RequestHandler = async (req, res, next) => {
  const userId = req.user?.userId;
  const areaId = req.user?.areaId;

  if (!userId || !areaId) {
    return next(new AppError("Usuario no autenticado", 401));
  }

  try {
    const data = await autorizacionService.obtenerSistemasDelUsuario(
      getDb(req),
      userId,
      areaId,
    );
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const cambiarSistema: RequestHandler = async (req, res, next) => {
  const userId = req.user?.userId;
  const areaId = req.user?.areaId;
  const tenantSlug = req.user?.tenantSlug;
  const tenantId = req.user?.tenantId;
  const email = req.user?.email;
  const nombre = req.user?.nombre;
  const { sistemaId } = req.body;

  if (!userId || !areaId || !tenantSlug || !tenantId || !email || !nombre) {
    return next(new AppError("Usuario no autenticado", 401));
  }

  const sistemaIdNum = Number(sistemaId);
  if (Number.isNaN(sistemaIdNum)) {
    return next(new AppError("sistemaId inválido", 400));
  }

  try {
    const result = await autorizacionService.cambiarSistema(
      getDb(req),
      userId,
      areaId,
      sistemaIdNum,
      tenantSlug,
      tenantId,
      email,
      nombre,
    );

    res.cookie("token", result.tokens.accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({ sistemaId: sistemaIdNum, menu: result.menu });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const { correo, contrasena, areaId, sistemaId, tenantSlug, mfaCode } = req.body;

  try {
    const result = await autorizacionService.login({
      correo,
      contrasena,
      areaId,
      sistemaId,
      tenantSlug,
      mfaCode,
    });

    // Setup MFA obligatorio: email enviado, frontend muestra mensaje
    if ("mfaSetupPending" in result) {
      res.status(200).json(result); // { mfaSetupPending: true, userId }
    // MFA requerido: NO setear cookies — el frontend debe solicitar el código
    } else if ("mfaRequired" in result) {
      res.status(200).json(result); // { mfaRequired: true, userId }
    } else {
      // Login completo: setear cookies HTTP-only
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 15,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      const { accessToken: _at, refreshToken: _rt, ...rest } = result;
      res.status(200).json(rest);
    }
  } catch (error) {
    res.status(401).json({
      mensaje:
        error instanceof Error ? error.message : "Error al iniciar sesión",
    });
  }
};

export const obtenerMenuporSistema: RequestHandler = async (req, res, next) => {
  const id = req.user?.sistemaId;

  if (typeof id !== "number" || Number.isNaN(id)) {
    return next(new AppError("ID inválido", 400));
  }
  try {
    const data = await autorizacionService.obtenerMenuPorSistema(getDb(req), id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (_req, res, _next) => {
  const cookieOpts = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: (NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  };
  res.clearCookie("token", cookieOpts);
  res.clearCookie("refreshToken", cookieOpts);
  res.status(200).json({ mensaje: "Sesión cerrada" });
};

export const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    // Intentar obtener refresh token del body o de la cookie
    // Express 5: req.body es undefined si no hay body JSON
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        mensaje: "Refresh token no proporcionado",
      });
    }

    // Refrescar tokens
    const result = await autorizacionService.refrescarToken(refreshToken);

    // Actualizar cookies
    res.cookie("token", result.accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 15, // 15 minutos
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    res.status(401).json({
      mensaje:
        error instanceof Error ? error.message : "Error al refrescar token",
    });
  }
};

export const verificarToken: RequestHandler = async (req, res, _next) => {
  // Si llegamos aquí, el middleware verificarToken ya validó el token
  res.status(200).json({
    valid: true,
    user: req.user,
  });
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    // Obtener datos completos del usuario desde la BD
    const usuario = await autorizacionService.obtenerUsuarioPorId(getDb(req), userId);

    if (!usuario || !usuario.activo) {
      throw new AppError("Usuario no encontrado o inactivo", 404);
    }

    res.json({ usuario });
  } catch (error) {
    next(error);
  }
};

export const contrasenaTemporal: RequestHandler = async (req, res, next) => {
  const email = req.user?.email;
  try {
    res.json({ success: true, email });
  } catch (error) {
    next(error);
  }
};

export const cambiarContrasenaTemporal: RequestHandler = async (
  req,
  res,
  next,
) => {
  const { contrasenaTemporal, contrasenaNueva } = req.body;
  const email = req.user?.email;
  const token = req.tokenTemporal;
  if (!email || !token) {
    throw new AppError("No existe correo", 403);
  }
  try {
    const result = await autorizacionService.cambiarContrasenaTemporal(
      getDb(req),
      contrasenaTemporal,
      contrasenaNueva,
      email,
      token,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ─── MFA Setup ───────────────────────────────────────────

export const iniciarSetupMfa: RequestHandler = async (req, res, next) => {
  const { setupToken } = req.body;
  if (!setupToken) return next(new AppError("setupToken requerido", 400));
  try {
    const result = await autorizacionService.iniciarSetupMfa(setupToken);
    res.status(200).json(result);
  } catch (error) {
    next(new AppError(error instanceof Error ? error.message : "Error al iniciar setup MFA", 400));
  }
};

export const activarMfa: RequestHandler = async (req, res, next) => {
  const { setupToken, code } = req.body;
  if (!setupToken || !code) {
    return next(new AppError("setupToken y code son requeridos", 400));
  }
  try {
    const result = await autorizacionService.activarMfa(setupToken, code);
    res.status(200).json(result); // { backupCodes: string[] }
  } catch (error) {
    next(new AppError(error instanceof Error ? error.message : "Error al activar MFA", 400));
  }
};
