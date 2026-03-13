import * as controller from "@controllers/usuarios.controller";
import { validate } from "@/libs/middleware/validate";
import { createUsuarioSchema, updateUsuarioSchema } from "@/libs/schemas/usuarios.schemas";
import { Router } from "express";

const router: Router = Router();

router
  .get("/", controller.getAllUsuarios)
  .get("/:usuarioId", controller.getUsuarioById)
  .post("/", validate(createUsuarioSchema), controller.createUsuario)
  .patch("/:usuarioId", validate(updateUsuarioSchema), controller.updateUsuario)
  .delete("/:usuarioId", controller.deleteUsuario);

export default router;
