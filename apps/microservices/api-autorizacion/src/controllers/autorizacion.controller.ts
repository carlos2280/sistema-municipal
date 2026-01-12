import { loadEnv } from "@/config/env";
import { AppError } from "@/libs/middleware/AppError";
import type { RequestHandler } from "express-serve-static-core";
import * as autorizacionService from "../services/autorizacion.service";
const { NODE_ENV } = loadEnv();

export const obtenerAreasUsuario: RequestHandler = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar credenciales y obtener áreas
    const { usuario, areas } = await autorizacionService.obtenerAreasUsuario(
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
      correo,
      contrasena,
      areaIdNum,
      // usuarioIdNum,
    );

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const { correo, contrasena, areaId, sistemaId } = req.body;

  try {
    const result = await autorizacionService.login({
      correo,
      contrasena,
      areaId,
      sistemaId,
    });

    // Setear access token en cookie (HTTP-only)
    res.cookie("token", result.accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 15, // 15 minutos
    });

    // Setear refresh token en cookie separada (HTTP-only)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    res.status(200).json({
      usuario: result.usuario,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
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
    const data = await autorizacionService.obtenerMenuPorSistema(id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (_req, res, _next) => {
  res.clearCookie("token"); // Elimina la cookie de access token
  res.clearCookie("refreshToken"); // Elimina la cookie de refresh token
  res.status(200).json({ mensaje: "Sesión cerrada" });
};

export const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    // Intentar obtener refresh token del body o de la cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

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

export const validateToken: RequestHandler = async (_req, _res, _next) => {};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Usuario no autenticado", 401);
    }

    // Obtener datos completos del usuario desde la BD
    const usuario = await autorizacionService.obtenerUsuarioPorId(userId);

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
