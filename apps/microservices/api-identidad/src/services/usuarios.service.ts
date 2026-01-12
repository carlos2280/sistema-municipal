import { db } from "@/app";
import { type NewUsuario, type UsuarioUpdate, usuarios } from "@/db/schemas";
import { generateRandomPassword } from "@/libs/utils/contrasenaAleatoria.utils";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "./email.service";
export const getAllUsuarios = async () => {
  try {
    return await db.select().from(usuarios);
  } catch (error) {
    throw new Error(
      `Error al obtener los usuarios: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getUsuarioById = async (id: number) => {
  try {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id));
    return usuario;
  } catch (error) {
    throw new Error(
      `Error al obtener el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const createUsuario = async (usuario: NewUsuario) => {
  try {
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    // Insertar el nuevo usuario y devolver el registro creado
    const [createdUsuario] = await db
      .insert(usuarios)
      .values({ ...usuario, password: hashedPassword, passwordTemp: true })
      .returning();

    // Enviar email de bienvenida (sin bloquear si falla)
    sendWelcomeEmail(
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

export const updateUsuario = async (id: number, data: UsuarioUpdate) => {
  try {
    const updatedData = { ...data };

    // Si incluye password, encriptarla
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
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

export const deleteUsuario = async (id: number) => {
  try {
    const [deletedUsuario] = await db
      .delete(usuarios)
      .where(eq(usuarios.id, id))
      .returning();
    return deletedUsuario;
  } catch (error) {
    throw new Error(
      `Error al eliminar el usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
