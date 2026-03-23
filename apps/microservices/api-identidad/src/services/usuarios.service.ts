import type { DbClient } from "@/db/client";
import { generateRandomPassword } from "@/libs/utils/contrasenaAleatoria.utils";
import { BCRYPT_ROUNDS } from "@municipal/core";
import {
  type NewUsuario,
  type UsuarioUpdate,
  usuarios,
} from "@municipal/db-identidad";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { sendWelcomeEmail } from "./email.service";

export const getAllUsuarios = async (db: DbClient) => {
  try {
    return await db.query.usuarios.findMany({
      columns: {
        password: false,
        mfaSecret: false,
        mfaBackupCodes: false,
      },
      where: isNull(usuarios.deletedAt),
    });
  } catch (error) {
    throw new Error(
      `Error al obtener los usuarios: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getUsuarioById = async (db: DbClient, id: number) => {
  try {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, id), isNull(usuarios.deletedAt)));
    return usuario;
  } catch (error) {
    throw new Error(
      `Error al obtener el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const createUsuario = async (db: DbClient, usuario: NewUsuario) => {
  try {
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);
    // Insertar el nuevo usuario y devolver el registro creado
    const [createdUsuario] = await db
      .insert(usuarios)
      .values({ ...usuario, password: hashedPassword, passwordTemp: true })
      .returning();

    // Enviar email de bienvenida (sin bloquear si falla)
    sendWelcomeEmail(
      db,
      createdUsuario.email,
      createdUsuario.nombreCompleto,
      createdUsuario.id,
      randomPassword,
    )
      .then((result) => {
        if (result.success) {
          console.log(`Email de bienvenida enviado a ${createdUsuario.email}`);
        } else {
          console.error(
            `Error al enviar email a ${createdUsuario.email}:`,
            result.error,
          );
        }
      })
      .catch((error) => {
        console.error("Error inesperado al enviar email:", error);
      });

    return createdUsuario;
  } catch (error) {
    throw new Error(
      `Error al crear el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const updateUsuario = async (
  db: DbClient,
  id: number,
  data: UsuarioUpdate,
) => {
  try {
    const updatedData = { ...data };

    // Si incluye password, encriptarla
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    const [updatedUsuario] = await db
      .update(usuarios)
      .set(updatedData)
      .where(eq(usuarios.id, id))
      .returning();
    return updatedUsuario;
  } catch (error) {
    throw new Error(
      `Error al actualizar el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const deleteUsuario = async (
  db: DbClient,
  id: number,
  deletedBy?: number,
) => {
  try {
    // Soft delete: marcar como eliminado en vez de borrar físicamente
    // TODO: pasar deletedBy desde el controller cuando se implemente el contexto de usuario
    const [softDeletedUsuario] = await db
      .update(usuarios)
      .set({ deletedAt: new Date(), deletedBy: deletedBy ?? null })
      .where(and(eq(usuarios.id, id), isNull(usuarios.deletedAt)))
      .returning();
    return softDeletedUsuario;
  } catch (error) {
    throw new Error(
      `Error al eliminar el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
