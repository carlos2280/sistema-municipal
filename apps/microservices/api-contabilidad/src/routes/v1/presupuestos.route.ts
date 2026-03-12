import * as controller from "@controllers/presupuestos.controller";
import { Router } from "express";

const router: Router = Router();

// Cuentas presupuestarias (endpoint especial antes de /:id)
router.get("/cuentas-presupuestarias", controller.listarCuentasPresupuestarias);

// Presupuestos CRUD
router.get("/", controller.listarPresupuestos);
router.post("/", controller.crearPresupuesto);
router.get("/:id", controller.obtenerPresupuesto);
router.patch("/:id", controller.actualizarPresupuesto);
router.delete("/:id", controller.eliminarPresupuesto);

// Equilibrio
router.get("/:id/equilibrio", controller.calcularEquilibrio);

// Detalle
router.post("/:id/detalle", controller.agregarLinea);
router.patch("/:id/detalle/:detalleId", controller.actualizarLinea);
router.delete("/:id/detalle/:detalleId", controller.eliminarLinea);

export default router;
