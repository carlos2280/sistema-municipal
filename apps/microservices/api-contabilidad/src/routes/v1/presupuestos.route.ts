import * as controller from "@controllers/presupuestos.controller";
import { validate } from "@/libs/middleware/validate";
import {
  actualizarLineaSchema,
  actualizarPresupuestoSchema,
  agregarLineaSchema,
  crearPresupuestoSchema,
} from "@/libs/schemas/presupuestos.schemas";
import { Router } from "express";

const router: Router = Router();

// Cuentas presupuestarias (endpoint especial antes de /:id)
router.get("/cuentas-presupuestarias", controller.listarCuentasPresupuestarias);

// Presupuestos CRUD
router.get("/", controller.listarPresupuestos);
router.post("/", validate(crearPresupuestoSchema), controller.crearPresupuesto);
router.get("/:id", controller.obtenerPresupuesto);
router.patch("/:id", validate(actualizarPresupuestoSchema), controller.actualizarPresupuesto);
router.delete("/:id", controller.eliminarPresupuesto);

// Equilibrio
router.get("/:id/equilibrio", controller.calcularEquilibrio);

// Detalle
router.post("/:id/detalle", validate(agregarLineaSchema), controller.agregarLinea);
router.patch("/:id/detalle/:detalleId", validate(actualizarLineaSchema), controller.actualizarLinea);
router.delete("/:id/detalle/:detalleId", controller.eliminarLinea);

export default router;
