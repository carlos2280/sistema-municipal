import areaRouter from "@routes/v1/areas.route";
import configuracionRouter from "@routes/v1/configuracion.route";
import menuRouter from "@routes/v1/menus.route";
import mfaRouter from "@routes/v1/mfa.route";
import organigramaRouter from "@routes/v1/organigrama.route";
import perfilRouter from "@routes/v1/perfiles.route";
import sistemasRouter from "@routes/v1/sistemas.route";
import usuarioRouter from "@routes/v1/usuarios.route";
import validaRouter from "@routes/v1/validaCredenciales.route";
import { Router } from "express";

const router: Router = Router();

router.use("/usuarios", usuarioRouter);
router.use("/areas", areaRouter);
router.use("/sistemas", sistemasRouter);
router.use("/perfiles", perfilRouter);
router.use("/menus", menuRouter);
router.use("/valida", validaRouter);
router.use("/organigrama", organigramaRouter);
router.use("/mfa", mfaRouter);
router.use("/configuracion", configuracionRouter);

export default router;
