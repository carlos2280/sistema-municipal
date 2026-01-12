import * as controller from "@controllers/sistemas.controller";
import { Router } from "express";

const router: Router = Router();

router
  .get("/", controller.getAllSistemas)
  .get("/:sistemaId", controller.getSistemaById)
  .post("/", controller.createSistema)
  .patch("/:sistemaId", controller.updateSistema)
  .delete("/:sistemaId", controller.deleteSistema);

export default router;
