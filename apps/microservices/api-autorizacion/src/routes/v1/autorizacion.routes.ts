import * as controller from "@/controllers/autorizacion.controller";
import { validarTokenTemporal } from "@/libs/middleware/validarTokenTemporal";
import { extractUser } from "@/libs/middleware/extractUser";
import { Router } from "express";
const router = Router();

router
  // Rutas públicas (flujo de login)
  .post("/areas", controller.obtenerAreasUsuario)
  .post("/sistemas", controller.obtenerSistemasPorAreaUsuario)
  .post("/login", controller.login)
  .post("/refresh-token", controller.refreshToken)

  // Rutas protegidas (requieren JWT)
  .get("/verificar-token", extractUser, controller.verificarToken)
  .post("/logout", extractUser, controller.logout)
  .get("/menu-sistema/", extractUser, controller.obtenerMenuporSistema)
  .get("/me", extractUser, controller.me)

  // Rutas con token temporal
  .post(
    "/cambiar-contrasena-temporal",
    validarTokenTemporal,
    controller.cambiarContrasenaTemporal,
  )
  .get(
    "/contrasena-temporal",
    validarTokenTemporal,
    controller.contrasenaTemporal,
  );

export default router;
