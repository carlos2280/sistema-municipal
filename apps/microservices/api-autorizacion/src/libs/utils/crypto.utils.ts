import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { getEnv } from "@/config/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

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
