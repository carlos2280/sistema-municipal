import * as controller from "@controllers/resolve.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/", controller.resolveHost);

export default router;
