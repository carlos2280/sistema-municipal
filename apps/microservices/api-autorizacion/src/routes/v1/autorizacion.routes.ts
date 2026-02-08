import * as controller from "@/controllers/autorizacion.controller";
import { validarTokenTemporal } from "@/libs/middleware/validarTokenTemporal";
import { verificarToken } from "@/libs/middleware/verficarToken";
import { Router } from "express";
const router = Router();

router
  // Rutas públicas (flujo de login)
  .post("/areas", controller.obtenerAreasUsuario)
  .post("/sistemas", controller.obtenerSistemasPorAreaUsuario)
  .post("/login", controller.login)
  .post("/refresh-token", controller.refreshToken)

  // Rutas protegidas (requieren JWT)
  .get("/verificar-token", verificarToken, controller.verificarToken)
  .post("/logout", verificarToken, controller.logout)
  .get("/menu-sistema/", verificarToken, controller.obtenerMenuporSistema)
  .get("/me", verificarToken, controller.me)

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
