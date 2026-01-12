import * as controller from "@controllers/validateCredenciales.controller";
import { Router } from "express";

const router: Router = Router();

router.post("/areas-usuario", controller.obtenerAreasUsuario);

export default router;
