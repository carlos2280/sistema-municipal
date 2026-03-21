import centrosCosto from "@routes/v1/centrosCosto.route";
import cuentasSubgrupo from "@routes/v1/cuentasSubgrupos.route";
import planesCuentas from "@routes/v1/planesCuentas.route";
import presupuestos from "@routes/v1/presupuestos.route";
import subprogramas from "@routes/v1/subprogramas.route";
import { Router } from "express";

const router: Router = Router();

router.use("/cuentas-subgrupos", cuentasSubgrupo);
router.use("/plan-cuentas", planesCuentas);
router.use("/centros-costo", centrosCosto);
router.use("/presupuestos", presupuestos);
router.use("/subprogramas", subprogramas);
export default router;
