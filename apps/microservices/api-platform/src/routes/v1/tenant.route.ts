import * as controller from "@controllers/tenant.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/transversal-db", controller.getTenantTransversalDb);

export default router;
