import v1Router from "@routes/v1";
import { Router } from "express";

const router: Router = Router();

router.use("/v1", v1Router);

export default router;
