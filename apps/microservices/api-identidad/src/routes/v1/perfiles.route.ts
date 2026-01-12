import * as controller from "@controllers/perfiles.controller";
import { Router } from "express";

const router: Router = Router();

router
  .get("/", controller.getAllPerfiles)
  .get("/:perfilId", controller.getPerfilById)
  .post("/", controller.createPerfil)
  .patch("/:perfilId", controller.updatePerfil)
  .delete("/:perfilId", controller.deletePerfil);

export default router;
