import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOn = vi.fn();
const mockEnd = vi.fn().mockResolvedValue(undefined);

vi.mock("pg", () => {
	const MockPool = vi.fn(function (this: Record<string, unknown>) {
		this.on = mockOn;
		this.end = mockEnd;
	});
	return { Pool: MockPool };
});

const baseConfig = {
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "secret",
};

async function freshModule() {
	vi.resetModules();
	mockOn.mockClear();
	mockEnd.mockClear();
	const mod = await import("../tenant-connection");
	const pg = await import("pg");
	vi.mocked(pg.Pool).mockClear();
	return { ...mod, Pool: pg.Pool };
}

describe("getTenantPool", () => {
	it("crea un nuevo pool para un tenant desconocido", async () => {
		const { getTenantPool, Pool } = await freshModule();

		const pool = getTenantPool("muni_alpha", baseConfig);

		expect(Pool).toHaveBeenCalledWith(
			expect.objectContaining({
				host: "localhost",
				database: "muni_alpha",
				max: 5,
			}),
		);
		expect(pool).toBeDefined();
		expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
	});

	it("reutiliza el pool para el mismo tenant", async () => {
		const { getTenantPool, Pool } = await freshModule();

		const pool1 = getTenantPool("muni_beta", baseConfig);
		const pool2 = getTenantPool("muni_beta", baseConfig);

		expect(pool1).toBe(pool2);
		expect(Pool).toHaveBeenCalledTimes(1);
	});

	it("crea pools distintos para tenants diferentes", async () => {
		const { getTenantPool, Pool } = await freshModule();

		const poolA = getTenantPool("muni_a", baseConfig);
		const poolB = getTenantPool("muni_b", baseConfig);

		expect(poolA).not.toBe(poolB);
		expect(Pool).toHaveBeenCalledTimes(2);
	});

	it("respeta maxConnections custom", async () => {
		const { getTenantPool, Pool } = await freshModule();

		getTenantPool("muni_custom", { ...baseConfig, maxConnections: 20 });

		expect(Pool).toHaveBeenCalledWith(
			expect.objectContaining({ max: 20 }),
		);
	});
});

describe("closeTenantPools", () => {
	it("cierra todos los pools y limpia el Map", async () => {
		const { getTenantPool, closeTenantPools } = await freshModule();

		getTenantPool("db1", baseConfig);
		getTenantPool("db2", baseConfig);

		await closeTenantPools();

		expect(mockEnd).toHaveBeenCalledTimes(2);
	});
});

describe("closeTenantPool", () => {
	it("cierra solo el pool especificado", async () => {
		const { getTenantPool, closeTenantPool } = await freshModule();

		getTenantPool("db_keep", baseConfig);
		getTenantPool("db_close", baseConfig);

		mockEnd.mockClear();
		await closeTenantPool("db_close");

		expect(mockEnd).toHaveBeenCalledTimes(1);
	});
});
