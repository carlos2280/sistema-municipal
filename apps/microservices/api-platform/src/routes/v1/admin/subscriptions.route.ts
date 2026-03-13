import * as controller from "@controllers/admin/subscriptions.controller";
import { validate } from "@/libs/middleware/validate";
import { createSubscriptionSchema, updateSubscriptionEstadoSchema } from "@/libs/schemas/admin.schemas";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.listSubscriptions);
router.post("/", validate(createSubscriptionSchema), controller.createSubscription);
router.put("/:id/estado", validate(updateSubscriptionEstadoSchema), controller.updateSubscriptionEstado);

export default router;
