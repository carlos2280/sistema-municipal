import * as controller from "@/controllers/configuracion.controller";
import { validate } from "@/libs/middleware/validate";
import { extractUser } from "@/libs/middleware/extractUser";
import { mfaPolicySchema } from "@/libs/schemas/autorizacion.schemas";
import { Router } from "express";

const router: Router = Router();

router
  .get("/mfa-policy", extractUser, controller.getMfaPolicy)
  .patch("/mfa-policy", extractUser, validate(mfaPolicySchema), controller.updateMfaPolicy);

export default router;
