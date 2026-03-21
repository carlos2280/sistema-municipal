import * as controller from "@controllers/subprogramas.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.listarSubprogramas);

export default router;
