import * as controller from "@controllers/admin/tenants.controller";
import { validate } from "@/libs/middleware/validate";
import { createTenantSchema, updateTenantSchema } from "@/libs/schemas/admin.schemas";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.listTenants);
router.get("/:id", controller.getTenant);
router.post("/", validate(createTenantSchema), controller.createTenant);
router.put("/:id", validate(updateTenantSchema), controller.updateTenant);
router.delete("/:id", controller.deactivateTenant);

export default router;
