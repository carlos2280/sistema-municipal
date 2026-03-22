import { requireAdminKey } from "@/libs/middleware/adminAuth.middleware";
import { Router } from "express";
import mesaAyudaRouter from "./mesaAyuda.route";
import modulesAdminRouter from "./modules.route";
import subscriptionsRouter from "./subscriptions.route";
import tenantsRouter from "./tenants.route";

const router: Router = Router();

// All admin routes require the API key
router.use(requireAdminKey);

router.use("/tenants", tenantsRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/modules", modulesAdminRouter);
router.use("/mesa-ayuda", mesaAyudaRouter);

export default router;
