import resolveRouter from "@routes/v1/resolve.route";
import modulesRouter from "@routes/v1/modules.route";
import { Router } from "express";

const router: Router = Router();

router.use("/resolve", resolveRouter);
router.use("/tenant/modules", modulesRouter);

export default router;
