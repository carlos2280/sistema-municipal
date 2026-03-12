import * as controller from "@controllers/centrosCosto.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.obtenerCentrosCosto);
router.post("/", controller.crearCentroCosto);
router.patch("/:id", controller.actualizarCentroCosto);
router.delete("/:id", controller.eliminarCentroCosto);

export default router;
