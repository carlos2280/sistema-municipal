import * as controller from "@controllers/admin/mesaAyuda.controller";
import { Router } from "express";

const router: Router = Router();

// Dashboard y monitoreo
router.get("/dashboard", controller.getDashboard);
router.get("/sla", controller.getSlaMonitoreo);

// Tickets — lectura
router.get("/tickets", controller.getTickets);
router.get("/tickets/:tenantSlug/:ticketId", controller.getTicketDetail);

// Tickets — gestión operativa
router.patch("/tickets/:tenantSlug/:ticketId/estado", controller.cambiarEstado);
router.patch("/tickets/:tenantSlug/:ticketId/asignar", controller.asignarTicket);
router.patch("/tickets/:tenantSlug/:ticketId/prioridad", controller.cambiarPrioridad);
router.patch("/tickets/:tenantSlug/:ticketId/categoria", controller.cambiarCategoria);
router.post("/tickets/:tenantSlug/:ticketId/comentarios", controller.agregarComentario);

// Tenants
router.get("/tenants", controller.getTenantsSummary);

// Categorías — CRUD
router.get("/categorias", controller.getCategorias);
router.post("/categorias", controller.createCategoria);
router.put("/categorias/:id", controller.updateCategoria);
router.delete("/categorias/:id", controller.deleteCategoria);

// Prioridades — config SLA
router.get("/prioridades", controller.getPrioridades);
router.put("/prioridades/:id", controller.updatePrioridad);

export default router;
