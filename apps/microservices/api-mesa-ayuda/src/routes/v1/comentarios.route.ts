import * as controller from "@/controllers/comentarios.controller";
import { validate } from "@/libs/middleware/validate";
import { crearComentarioSchema } from "@/libs/schemas/comentarios.schemas";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

router.get("/", controller.listar);
router.post("/", validate(crearComentarioSchema), controller.crear);
router.delete("/:cid", controller.eliminar);

export default router;
