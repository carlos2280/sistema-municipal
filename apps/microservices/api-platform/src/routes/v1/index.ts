import adminRouter from "@routes/v1/admin";
import modulesRouter from "@routes/v1/modules.route";
import resolveRouter from "@routes/v1/resolve.route";
import tenantRouter from "@routes/v1/tenant.route";
import { Router } from "express";

const router: Router = Router();

router.use("/resolve", resolveRouter);
router.use("/tenant/modules", modulesRouter);
router.use("/tenant", tenantRouter);
router.use("/admin", adminRouter);

export default router;
