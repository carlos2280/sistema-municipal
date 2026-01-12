import * as controller from "@controllers/areas.controller";
import { AreasSwagger } from "@decorators/areas.swagger";
import { Router } from "express";

const router: Router = Router();

router
  .get("/", controller.getAllAreas)
  .get("/:areaId", controller.getAreaById)
  .post("/", controller.createArea)
  .patch("/:areaId", controller.updateArea)
  .delete("/:areaId", controller.deleteArea);

// Exporta los metadatos Swagger para ser usados por swagger-jsdoc
export const AreasApiDocs = {
  "/v1/areas": {
    get: AreasSwagger.getAll,
    post: AreasSwagger.create,
  },
  "/v1/areas/{areaId}": {
    get: AreasSwagger.getById,
    patch: AreasSwagger.update,
    delete: AreasSwagger.delete,
  },
};

export default router;
