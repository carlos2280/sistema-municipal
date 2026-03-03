import * as controller from "@controllers/modules.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.getTenantModules);

export default router;
