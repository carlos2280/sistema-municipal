import * as controller from "@controllers/organigrama.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.getOrganigrama);

export default router;
