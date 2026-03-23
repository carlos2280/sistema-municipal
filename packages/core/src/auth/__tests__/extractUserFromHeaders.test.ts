import { describe, it, expect } from "vitest";
import {
	extractUserFromHeaders,
	GATEWAY_SIGNATURE,
	X_USER_HEADERS,
} from "../index";

function buildHeaders(
	overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
	return {
		[X_USER_HEADERS.secured]: GATEWAY_SIGNATURE,
		[X_USER_HEADERS.userId]: "42",
		[X_USER_HEADERS.email]: "admin@muni.gob",
		[X_USER_HEADERS.nombre]: "Carlos Admin",
		[X_USER_HEADERS.areaId]: "3",
		[X_USER_HEADERS.sistemaId]: "1",
		[X_USER_HEADERS.sub]: "uuid-sub-123",
		[X_USER_HEADERS.tenantId]: "10",
		[X_USER_HEADERS.tenantSlug]: "muni_test",
		[X_USER_HEADERS.tenantDbName]: "muni_test_db",
		[X_USER_HEADERS.transversalDbName]: "transversal_test",
		...overrides,
	};
}

describe("extractUserFromHeaders", () => {
	it("extrae UserPayload completo cuando todos los headers están presentes", () => {
		const result = extractUserFromHeaders(buildHeaders());

		expect(result).toEqual({
			sub: "uuid-sub-123",
			userId: 42,
			email: "admin@muni.gob",
			nombre: "Carlos Admin",
			areaId: 3,
			sistemaId: 1,
			tenantId: 10,
			tenantSlug: "muni_test",
			tenantDbName: "muni_test_db",
			transversalDbName: "transversal_test",
		});
	});

	it("retorna null si falta el header x-secured-by", () => {
		const headers = buildHeaders({ [X_USER_HEADERS.secured]: undefined });

		expect(extractUserFromHeaders(headers)).toBeNull();
	});

	it("retorna null si x-secured-by tiene valor incorrecto", () => {
		const headers = buildHeaders({ [X_USER_HEADERS.secured]: "Spoofed" });

		expect(extractUserFromHeaders(headers)).toBeNull();
	});

	it("retorna null si falta userId", () => {
		const headers = buildHeaders({ [X_USER_HEADERS.userId]: undefined });

		expect(extractUserFromHeaders(headers)).toBeNull();
	});

	it("retorna null si falta email", () => {
		const headers = buildHeaders({ [X_USER_HEADERS.email]: undefined });

		expect(extractUserFromHeaders(headers)).toBeNull();
	});

	it("usa defaults cuando headers opcionales están ausentes", () => {
		const headers = buildHeaders({
			[X_USER_HEADERS.nombre]: undefined,
			[X_USER_HEADERS.areaId]: undefined,
			[X_USER_HEADERS.sistemaId]: undefined,
			[X_USER_HEADERS.tenantId]: undefined,
			[X_USER_HEADERS.tenantSlug]: undefined,
			[X_USER_HEADERS.tenantDbName]: undefined,
			[X_USER_HEADERS.transversalDbName]: undefined,
			[X_USER_HEADERS.sub]: undefined,
		});

		const result = extractUserFromHeaders(headers);

		expect(result).not.toBeNull();
		expect(result!.nombre).toBe("");
		expect(result!.areaId).toBe(0);
		expect(result!.sistemaId).toBe(0);
		expect(result!.tenantId).toBe(0);
		expect(result!.tenantSlug).toBe("default");
		expect(result!.tenantDbName).toBe("muni_default");
		expect(result!.transversalDbName).toBe("transversal");
		expect(result!.sub).toBe("42"); // fallback to userId string
	});
});
