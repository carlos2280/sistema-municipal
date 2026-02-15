import { extractUser } from "@/libs/middleware/extractUser";
import * as controller from "@controllers/planesCuentas.controller";
import { Router } from "express";

const router: Router = Router();

// Crear nueva cuenta de plan
router.post("/", controller.crearPlanesCuenta);

// Obtener lista de cuentas de plan
router.get("/", controller.obtenerPlanesCuentas);

// Obtener árbol de planes de cuenta
router.get("/arbol", controller.obtenerArbolPlanes);

// Obtener árbol completo (subgrupos + planes)
router.get("/arbol-completo", extractUser, controller.obtenerArbolCompleto);

// Verificar si un código de cuenta existe
router.get("/verificar-codigo", controller.verificarCodigoExiste);

// Operaciones CRUD por ID de cuenta de plan
router.get("/:id", controller.obtenerPlanesCuentaPorId);
router.patch("/:id", controller.actualizarPlanesCuenta);
router.delete("/:id", controller.eliminarPlanesCuenta);

export default router;
