import { describe, it, expect } from "vitest";
import { AppError, createErrorResponse } from "../index";

describe("AppError", () => {
	it("almacena statusCode, code y message correctamente", () => {
		const err = new AppError(404, "NOT_FOUND", "Recurso no encontrado");

		expect(err.statusCode).toBe(404);
		expect(err.code).toBe("NOT_FOUND");
		expect(err.message).toBe("Recurso no encontrado");
		expect(err.name).toBe("AppError");
	});

	it("extiende Error y es instancia de Error", () => {
		const err = new AppError(500, "INTERNAL", "error");

		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(AppError);
	});
});

describe("createErrorResponse", () => {
	it("crea response con datos de AppError", () => {
		const err = new AppError(403, "FORBIDDEN", "Sin permiso");
		const response = createErrorResponse(err, "req-123");

		expect(response).toEqual({
			success: false,
			code: "FORBIDDEN",
			message: "Sin permiso",
			requestId: "req-123",
			timestamp: expect.any(String),
		});
	});

	it("crea response genérica para Error estándar", () => {
		const err = new Error("algo falló");
		const response = createErrorResponse(err, "req-456");

		expect(response.success).toBe(false);
		expect(response.code).toBe("INTERNAL_ERROR");
		expect(response.message).toBe("Error interno del servidor");
		expect(response.requestId).toBe("req-456");
	});

	it("incluye timestamp ISO válido", () => {
		const response = createErrorResponse(new Error("x"), "req-789");
		const parsed = new Date(response.timestamp);

		expect(parsed.getTime()).not.toBeNaN();
	});
});
