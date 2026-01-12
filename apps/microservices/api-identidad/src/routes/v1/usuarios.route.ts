import * as controller from "@controllers/usuarios.controller";
import { Router } from "express";

const router: Router = Router();

router
  .get("/", controller.getAllUsuarios)
  .get("/:usuarioId", controller.getUsuarioById)
  .post("/", controller.createUsuario)
  .patch("/:usuarioId", controller.updateUsuario)
  .delete("/:usuarioId", controller.deleteUsuario);

export default router;
