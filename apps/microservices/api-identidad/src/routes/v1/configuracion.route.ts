import * as controller from "@controllers/configuracion.controller";
import { Router } from "express";

const router: Router = Router();

router
  .get("/usuarios-mfa", controller.getUsuariosMfa)
  .post("/usuarios/:id/reset-mfa", controller.resetMfa);

export default router;
