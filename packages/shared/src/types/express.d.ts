/**
 * Augmentación de Express para soporte multi-tenant.
 *
 * `req.tenantDb` contiene la instancia de drizzle conectada a la DB
 * del tenant actual. Cada microservicio lo tipará con su propio schema.
 */
declare module "express-serve-static-core" {
	interface Request {
		tenantDb?: unknown;
	}
}
