import * as controller from "@/controllers/autorizacion.controller";
import { validate } from "@/libs/middleware/validate";
import { validarTokenTemporal } from "@/libs/middleware/validarTokenTemporal";
import { extractUser } from "@/libs/middleware/extractUser";
import {
  areasSchema,
  cambiarContrasenaTemporalSchema,
  cambiarSistemaSchema,
  loginSchema,
  mfaSetupActivarSchema,
  mfaSetupIniciarSchema,
  sistemasSchema,
} from "@/libs/schemas/autorizacion.schemas";
import { Router } from "express";
const router = Router();

router
  // Rutas públicas (flujo de login)
  .post("/areas", validate(areasSchema), controller.obtenerAreasUsuario)
  .post("/sistemas", validate(sistemasSchema), controller.obtenerSistemasPorAreaUsuario)
  .post("/login", validate(loginSchema), controller.login)
  .post("/refresh-token", controller.refreshToken)

  // Rutas protegidas (requieren JWT)
  .get("/verificar-token", extractUser, controller.verificarToken)
  .post("/logout", extractUser, controller.logout)
  .get("/menu-sistema/", extractUser, controller.obtenerMenuporSistema)
  .get("/me", extractUser, controller.me)
  .get("/mis-sistemas", extractUser, controller.obtenerMisSistemas)
  .post("/cambiar-sistema", extractUser, validate(cambiarSistemaSchema), controller.cambiarSistema)

  // Setup MFA (usuario sin MFA en tenant con política "required")
  .post("/mfa-setup/iniciar", validate(mfaSetupIniciarSchema), controller.iniciarSetupMfa)
  .post("/mfa-setup/activar", validate(mfaSetupActivarSchema), controller.activarMfa)

  // Rutas con token temporal
  .post(
    "/cambiar-contrasena-temporal",
    validarTokenTemporal,
    validate(cambiarContrasenaTemporalSchema),
    controller.cambiarContrasenaTemporal,
  )
  .get(
    "/contrasena-temporal",
    validarTokenTemporal,
    controller.contrasenaTemporal,
  );

export default router;
