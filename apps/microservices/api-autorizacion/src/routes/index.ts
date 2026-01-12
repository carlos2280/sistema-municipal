import v1Router from "@routes/v1";
import { Router } from "express";
// import listEndpoints from 'express-list-endpoints';
const router: Router = Router();

router.use("/v1", v1Router);

// // Al final de tu app.ts, después de montar todas las rutas:
// console.log("[Rutas disponibles en API Autorización]");
// console.log(listEndpoints(router));

export default router;
