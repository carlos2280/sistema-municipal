import { randomBytes } from "node:crypto";
import type { DbClient } from "@/db/client";
import { usuarios } from "@municipal/db-identidad";
import { AppError } from "@/libs/middleware/AppError";
import { decryptSecret, encryptSecret } from "@/libs/utils/crypto.utils";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
import QRCode from "qrcode";

// ─── Constantes ──────────────────────────────────────────────────────────────

const ISSUER = "Sistema Municipal";
const TOTP_SECRET_BYTES = 20; // 160 bits — recomendado RFC 6238
const BACKUP_CODE_COUNT = 8;
const BCRYPT_ROUNDS = 12;

// Rate limiting en memoria: máx 5 intentos fallidos por usuario en ventana de 15 min
const _attemptStore = new Map<number, { count: number; resetAt: number }>();

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface MfaSetupResult {
  secret: string; // base32 — para mostrar como alternativa al QR
  qrCodeDataUrl: string; // data:image/png;base64,... para <img>
  otpauthUrl: string; // otpauth:// — para apps compatibles
}

export interface MfaEnableResult {
  backupCodes: string[]; // 8 códigos en texto plano — mostrar UNA SOLA VEZ
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

function checkRateLimit(userId: number): void {
  const now = Date.now();
  const entry = _attemptStore.get(userId);

  if (!entry || entry.resetAt < now) {
    _attemptStore.set(userId, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }

  if (entry.count >= 5) {
    const waitSec = Math.ceil((entry.resetAt - now) / 1000);
    throw new AppError(
      `Demasiados intentos fallidos. Intente nuevamente en ${waitSec} segundos.`,
      429,
    );
  }

  entry.count++;
}

function clearRateLimit(userId: number): void {
  _attemptStore.delete(userId);
}

/** Genera 8 códigos de respaldo de 10 caracteres (formato XXXXX-XXXXX). */
function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = randomBytes(8).toString("hex").toUpperCase().slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

/** Normaliza un backup code para comparación: elimina guión y lleva a mayúsculas. */
function normalizeBackupCode(code: string): string {
  return code.replace("-", "").toUpperCase();
}

async function findUserOrThrow(db: DbClient, userId: number) {
  const user = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, userId),
  });
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return user;
}

// ─── Servicio público ─────────────────────────────────────────────────────────

/**
 * Retorna el estado MFA actual del usuario.
 */
export async function getMfaStatus(db: DbClient, userId: number) {
  const user = await findUserOrThrow(db, userId);
  return {
    mfaEnabled: user.mfaEnabled,
    mfaVerified: user.mfaVerified,
  };
}

/**
 * Paso 1 del enrollamiento: genera un secreto TOTP y lo guarda cifrado
 * con mfaEnabled=false. Devuelve el QR y el secreto en base32.
 *
 * Si el usuario ya tiene MFA activo y verificado, lanza 409.
 * Si llama a setup varias veces sin completar enable, simplemente
 * sobreescribe el secreto pendiente (no es peligroso).
 */
export async function setupMfa(
  db: DbClient,
  userId: number,
  email: string,
): Promise<MfaSetupResult> {
  const user = await findUserOrThrow(db, userId);

  if (user.mfaEnabled && user.mfaVerified) {
    throw new AppError("MFA ya está activo en esta cuenta.", 409);
  }

  // Generar secreto con entropía máxima (160 bits = 20 bytes en base32)
  const secret = authenticator.generateSecret(TOTP_SECRET_BYTES);

  // Guardar cifrado (pendiente de confirmar — mfaEnabled sigue false)
  await db
    .update(usuarios)
    .set({
      mfaSecret: encryptSecret(secret),
      mfaVerified: false,
    })
    .where(eq(usuarios.id, userId));

  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 256,
  });

  return { secret, qrCodeDataUrl, otpauthUrl };
}

/**
 * Paso 2 del enrollamiento: valida el primer código TOTP del usuario
 * y activa MFA definitivamente. Genera y devuelve los 8 backup codes
 * en texto plano — es la ÚNICA vez que se exponen.
 */
export async function enableMfa(
  db: DbClient,
  userId: number,
  totpCode: string,
): Promise<MfaEnableResult> {
  const user = await findUserOrThrow(db, userId);

  if (user.mfaEnabled && user.mfaVerified) {
    throw new AppError("MFA ya está activo en esta cuenta.", 409);
  }

  if (!user.mfaSecret) {
    throw new AppError(
      "No se encontró secreto MFA. Inicie el proceso de configuración desde /mfa/setup.",
      400,
    );
  }

  const secret = decryptSecret(user.mfaSecret);
  const isValid = authenticator.verify({ token: totpCode, secret });

  if (!isValid) {
    throw new AppError(
      "Código incorrecto. Verifique la hora de su dispositivo y vuelva a intentarlo.",
      400,
    );
  }

  // Generar y hashear backup codes
  const plaintextCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(
    plaintextCodes.map((c) => bcrypt.hash(normalizeBackupCode(c), BCRYPT_ROUNDS)),
  );

  await db
    .update(usuarios)
    .set({
      mfaEnabled: true,
      mfaVerified: true,
      mfaBackupCodes: hashedCodes,
    })
    .where(eq(usuarios.id, userId));

  return { backupCodes: plaintextCodes };
}

/**
 * Verifica un código TOTP durante el flujo de login.
 * Aplica rate limiting: máx 5 intentos por usuario en 15 minutos.
 */
export async function verifyMfaCode(
  db: DbClient,
  userId: number,
  totpCode: string,
): Promise<void> {
  checkRateLimit(userId);

  const user = await findUserOrThrow(db, userId);

  if (!user.mfaEnabled || !user.mfaSecret) {
    throw new AppError("MFA no está habilitado para este usuario.", 400);
  }

  const secret = decryptSecret(user.mfaSecret);
  const isValid = authenticator.verify({ token: totpCode, secret });

  if (!isValid) {
    throw new AppError("Código MFA inválido.", 401);
  }

  clearRateLimit(userId);
}

/**
 * Verifica y consume un backup code de un solo uso.
 * Aplica el mismo rate limiting que verifyMfaCode.
 * El código se elimina del array tras su uso (no reutilizable).
 */
export async function verifyBackupCode(
  db: DbClient,
  userId: number,
  inputCode: string,
): Promise<void> {
  checkRateLimit(userId);

  const user = await findUserOrThrow(db, userId);

  if (!user.mfaEnabled) {
    throw new AppError("MFA no está habilitado para este usuario.", 400);
  }

  const storedHashes = (user.mfaBackupCodes as string[] | null) ?? [];

  if (storedHashes.length === 0) {
    throw new AppError(
      "No quedan códigos de respaldo disponibles. Contacte al administrador.",
      400,
    );
  }

  const normalized = normalizeBackupCode(inputCode);
  let matchIndex = -1;

  for (let i = 0; i < storedHashes.length; i++) {
    const match = await bcrypt.compare(normalized, storedHashes[i]);
    if (match) {
      matchIndex = i;
      break;
    }
  }

  if (matchIndex === -1) {
    throw new AppError("Código de respaldo inválido.", 401);
  }

  // Eliminar el código usado (consumo único)
  const remaining = storedHashes.filter((_, i) => i !== matchIndex);
  await db
    .update(usuarios)
    .set({ mfaBackupCodes: remaining })
    .where(eq(usuarios.id, userId));

  clearRateLimit(userId);
}

/**
 * Desactiva MFA. Requiere verificar el código TOTP actual
 * para evitar que una sesión comprometida lo desactive silenciosamente.
 */
export async function disableMfa(
  db: DbClient,
  userId: number,
  totpCode: string,
): Promise<void> {
  const user = await findUserOrThrow(db, userId);

  if (!user.mfaEnabled || !user.mfaSecret) {
    throw new AppError("MFA no está habilitado para este usuario.", 400);
  }

  const secret = decryptSecret(user.mfaSecret);
  const isValid = authenticator.verify({ token: totpCode, secret });

  if (!isValid) {
    throw new AppError(
      "Código inválido. MFA no fue desactivado por seguridad.",
      401,
    );
  }

  await db
    .update(usuarios)
    .set({
      mfaEnabled: false,
      mfaVerified: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    })
    .where(eq(usuarios.id, userId));
}
