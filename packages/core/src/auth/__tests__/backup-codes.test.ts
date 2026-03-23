import { describe, it, expect } from "vitest";
import { generateBackupCodes } from "../backup-codes";

describe("generateBackupCodes", () => {
	it("genera exactamente 8 códigos", () => {
		const codes = generateBackupCodes();

		expect(codes).toHaveLength(8);
	});

	it("cada código tiene formato XXXXX-XXXXX (hex mayúsculas)", () => {
		const codes = generateBackupCodes();

		for (const code of codes) {
			expect(code).toMatch(/^[0-9A-F]{5}-[0-9A-F]{5}$/);
		}
	});

	it("genera códigos únicos en cada invocación", () => {
		const batch1 = generateBackupCodes();
		const batch2 = generateBackupCodes();

		const allCodes = new Set([...batch1, ...batch2]);
		expect(allCodes.size).toBe(16);
	});
});
