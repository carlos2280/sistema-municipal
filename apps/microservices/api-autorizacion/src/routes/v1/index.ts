import autorizacionRouter from "@routes/v1/autorizacion.routes";

import { Router } from "express";

const router: Router = Router();

router.use("/autorizacion", autorizacionRouter);

export default router;
