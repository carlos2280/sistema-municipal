import autorizacionRouter from "@routes/v1/autorizacion.routes";
import configuracionRouter from "@routes/v1/configuracion.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/autorizacion", autorizacionRouter);
router.use("/configuracion", configuracionRouter);

export default router;
