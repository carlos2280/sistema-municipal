import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { getEnv } from "@/config/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96 bits — recomendado por NIST para GCM
const TAG_BYTES = 16; // 128 bits — longitud de autenticación

function getDerivedKey(): Buffer {
  const { MFA_ENCRYPTION_KEY } = getEnv();
  const key = Buffer.from(MFA_ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error(
      "MFA_ENCRYPTION_KEY inválida: debe ser exactamente 32 bytes (64 hex chars)",
    );
  }
  return key;
}

/**
 * Cifra un texto con AES-256-GCM.
 * El resultado incluye IV + tag de autenticación + ciphertext en hex.
 * Formato: <iv:24hex><tag:32hex><ciphertext:hex>
 */
export function encryptSecret(plaintext: string): string {
  const key = getDerivedKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

/**
 * Descifra un texto cifrado con encryptSecret().
 * Lanza error si el tag de autenticación no coincide (tamper detection).
 */
export function decryptSecret(ciphertext: string): string {
  const key = getDerivedKey();
  const buf = Buffer.from(ciphertext, "hex");

  if (buf.length < IV_BYTES + TAG_BYTES + 1) {
    throw new Error("Ciphertext MFA inválido o corrupto");
  }

  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const encrypted = buf.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Comparación de strings en tiempo constante para prevenir timing attacks.
 * Usar para comparar tokens, códigos y hashes.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
