import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import { usuarios } from "@municipal/db-identidad";
import { eq } from "drizzle-orm";

export interface UsuarioMfaStatus {
  id: number;
  email: string;
  nombreCompleto: string;
  mfaEnabled: boolean;
  mfaVerified: boolean;
}

export const getUsuariosMfaStatus = async (
  db: DbClient,
): Promise<UsuarioMfaStatus[]> => {
  return db
    .select({
      id: usuarios.id,
      email: usuarios.email,
      nombreCompleto: usuarios.nombreCompleto,
      mfaEnabled: usuarios.mfaEnabled,
      mfaVerified: usuarios.mfaVerified,
    })
    .from(usuarios);
};

export const resetMfaUsuario = async (
  db: DbClient,
  usuarioId: number,
): Promise<void> => {
  const [usuario] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId));

  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  await db
    .update(usuarios)
    .set({
      mfaEnabled: false,
      mfaVerified: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      updatedAt: new Date(),
    })
    .where(eq(usuarios.id, usuarioId));
};
