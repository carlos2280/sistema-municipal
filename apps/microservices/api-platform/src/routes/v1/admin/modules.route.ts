import { db } from "@/app";
import { modulos } from "@municipal/db-platform";
import { asc } from "drizzle-orm";
import { Router } from "express";

const router: Router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await db.select().from(modulos).orderBy(asc(modulos.orden));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
