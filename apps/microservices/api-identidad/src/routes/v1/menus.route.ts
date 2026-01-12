import * as controller from "@controllers/menus.controller";
import { Router } from "express";

const router: Router = Router();

// Rutas básicas CRUD
router
  .get("/", controller.getAllMenus)
  .get("/:menuId", controller.getMenuById)
  .post("/", controller.createMenu)
  .patch("/:menuId", controller.updateMenu)
  .delete("/:menuId", controller.deleteMenu);

// Rutas específicas para menús
router
  .get("/sistema/:sistemaId", controller.getMenusBySistema)
  .get("/submenus/:padreId", controller.getSubmenus);

export default router;
