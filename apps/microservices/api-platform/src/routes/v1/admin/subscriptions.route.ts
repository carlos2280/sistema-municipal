import * as controller from "@controllers/admin/subscriptions.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.listSubscriptions);
router.post("/", controller.createSubscription);
router.put("/:id/estado", controller.updateSubscriptionEstado);

export default router;
