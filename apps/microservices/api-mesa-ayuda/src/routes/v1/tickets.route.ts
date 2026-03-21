import * as controller from "@/controllers/tickets.controller";
import { validate } from "@/libs/middleware/validate";
import {
  actualizarTicketSchema,
  asignarTicketSchema,
  cambiarEstadoSchema,
  crearTicketSchema,
} from "@/libs/schemas/tickets.schemas";
import { Router } from "express";

const router: Router = Router();

router.get("/stats", controller.stats);
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", validate(crearTicketSchema), controller.crear);
router.patch("/:id", validate(actualizarTicketSchema), controller.actualizar);
router.patch("/:id/estado", validate(cambiarEstadoSchema), controller.cambiarEstado);
router.patch("/:id/asignar", validate(asignarTicketSchema), controller.asignar);
router.delete("/:id", controller.eliminar);

export default router;
