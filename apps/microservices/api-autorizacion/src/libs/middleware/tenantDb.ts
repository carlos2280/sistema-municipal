import { loadEnv } from "@/config/env";
import { type DbClient, createTenantDbClient } from "@/db/client";
import type { NextFunction, Request, Response } from "express";

const env = loadEnv();

declare module "express-serve-static-core" {
	interface Request {
		tenantDb?: DbClient;
	}
}

/**
 * Middleware que lee x-tenant-db-name del header (inyectado por el gateway)
 * y crea una instancia de drizzle conectada a la DB de ese tenant.
 */
export const tenantDbMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const dbName = req.headers["x-tenant-db-name"] as string | undefined;

	if (!dbName) {
		// Fallback: usar la DB por defecto del env (backward compat)
		return next();
	}

	req.tenantDb = createTenantDbClient(dbName, env);
	next();
};
