import * as controller from "@controllers/admin/tenants.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.listTenants);
router.get("/:id", controller.getTenant);
router.post("/", controller.createTenant);
router.put("/:id", controller.updateTenant);
router.delete("/:id", controller.deactivateTenant);

export default router;
