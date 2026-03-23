import { randomBytes } from "node:crypto";

const BACKUP_CODE_COUNT = 8;

/**
 * Genera códigos de respaldo MFA usando crypto.randomBytes (CSPRNG).
 * Formato: XXXXX-XXXXX (10 caracteres hexadecimales en mayúsculas).
 * Devuelve BACKUP_CODE_COUNT códigos en texto plano — hashear antes de persistir.
 */
export function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = randomBytes(8).toString("hex").toUpperCase().slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
