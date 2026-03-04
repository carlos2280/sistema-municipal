import * as controller from "@/controllers/configuracion.controller";
import { extractUser } from "@/libs/middleware/extractUser";
import { Router } from "express";

const router: Router = Router();

router
  .get("/mfa-policy", extractUser, controller.getMfaPolicy)
  .patch("/mfa-policy", extractUser, controller.updateMfaPolicy);

export default router;
