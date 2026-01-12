import cuentasSubgrupo from "@routes/v1/cuentasSubgrupos.route";
import planesCuentas from "@routes/v1/planesCuentas.route";
import { Router } from "express";

const router: Router = Router();

router.use("/cuentas-subgrupos", cuentasSubgrupo);
router.use("/plan-cuentas", planesCuentas);
export default router;
