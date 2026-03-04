import * as controller from "@controllers/mfa.controller";
import { Router } from "express";

const router: Router = Router();

// Estado actual de MFA del usuario autenticado
router.get("/status", controller.getStatus);

// Paso 1 de enrollamiento: genera QR + secreto pendiente
router.get("/setup", controller.setup);

// Paso 2 de enrollamiento: confirma primer código y activa MFA
router.post("/enable", controller.enable);

// Verificación de código durante el flujo de login (llamada interna desde api-autorizacion)
router.post("/verify", controller.verify);

// Desactivar MFA (requiere código TOTP actual para confirmar)
router.post("/disable", controller.disable);

export default router;
