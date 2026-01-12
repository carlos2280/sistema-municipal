import { AppError } from "@/libs/middleware/AppError";
import * as validarService from "@services/validarCredenciales.service"; // Asegúrate de que la ruta sea correcta
import type { RequestHandler } from "express";

export const obtenerAreasUsuario: RequestHandler = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar credenciales y obtener áreas
    const { usuario, areas } = await validarService.validarCredenciales(
      correo,
      contrasena,
    );

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new AppError("Cuenta desactivada", 403);
    }

    // Responder solo con las áreas (y datos básicos del usuario si necesitas)
    res.status(200).json({
      data: {
        usuario: {
          id: usuario.id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
        },
        areas,
      },
    });
  } catch (error) {
    next(error);
  }
};
