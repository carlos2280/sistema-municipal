import * as controller from "@controllers/cuentasSubgrupos.controller";
import { Router } from "express";

const router: Router = Router();

// Crear un nuevo subgrupo de cuentas
router.post("/", controller.crearCuentasSubgrupo);

// Obtener lista de subgrupos de cuentas
router.get("/", controller.obtenerCuentasSubgrupos);

// Obtener árbol completo de subgrupos
router.get("/arbol", controller.obtenerArbolSubgrupos);

// Operaciones CRUD por ID de subgrupo
router.get("/:id", controller.obtenerCuentasSubgrupoPorId);
router.patch("/:id", controller.actualizarCuentasSubgrupo);
router.delete("/:id", controller.eliminarCuentasSubgrupo);

export default router;
