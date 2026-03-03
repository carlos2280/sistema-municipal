/**
 * Gestor de pools de conexión por tenant.
 *
 * Cada tenant tiene su propia base de datos PostgreSQL.
 * Este módulo mantiene un Map<dbName, Pool> para reutilizar pools
 * y evitar crear conexiones nuevas en cada request.
 */
import { Pool } from "pg";

export interface TenantPoolConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	ssl?: boolean;
	maxConnections?: number;
}

const tenantPools = new Map<string, Pool>();

/**
 * Retorna un pool para la DB indicada, creándolo si no existe.
 * El pool se reutiliza en requests subsecuentes al mismo tenant.
 */
export function getTenantPool(
	dbName: string,
	config: TenantPoolConfig,
): Pool {
	const existing = tenantPools.get(dbName);
	if (existing) return existing;

	const pool = new Pool({
		host: config.host,
		port: config.port,
		user: config.user,
		password: config.password,
		database: dbName,
		max: config.maxConnections ?? 5,
		ssl: config.ssl ? { rejectUnauthorized: false } : false,
	});

	pool.on("error", (err) => {
		console.error(`[TenantPool] Error inesperado en pool "${dbName}":`, err);
	});

	tenantPools.set(dbName, pool);
	return pool;
}

/**
 * Cierra todos los pools de tenant. Usar en shutdown graceful.
 */
export async function closeTenantPools(): Promise<void> {
	const entries = [...tenantPools.entries()];
	for (const [name, pool] of entries) {
		await pool.end();
		tenantPools.delete(name);
	}
}

/**
 * Cierra y elimina el pool de un tenant específico.
 */
export async function closeTenantPool(dbName: string): Promise<void> {
	const pool = tenantPools.get(dbName);
	if (pool) {
		await pool.end();
		tenantPools.delete(dbName);
	}
}
