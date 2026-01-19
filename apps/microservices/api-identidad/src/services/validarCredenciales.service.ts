import { db } from "@/app";
import { areas, perfilAreaUsuario, perfiles, usuarios } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const validarCredenciales = async (
  correo: string,
  contrasena: string,
) => {
  try {
    // 1. Buscar usuario por email
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, correo),
    });

    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // 2. Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.password);
    if (!contrasenaValida) {
      throw new Error("Credenciales inválidas");
    }

    // 3. Obtener áreas y perfiles del usuario (a través de perfilAreaUsuario)
    const areasConPerfiles = await db
      .select({
        area: {
          id: areas.id,
          nombre: areas.nombre,
        },
        perfil: {
          id: perfiles.id,
          nombre: perfiles.nombre,
        },
      })
      .from(perfilAreaUsuario)
      .innerJoin(areas, eq(perfilAreaUsuario.areaId, areas.id))
      .innerJoin(perfiles, eq(perfilAreaUsuario.perfilId, perfiles.id))
      .where(eq(perfilAreaUsuario.usuarioId, usuario.id));

    // 4. Formatear la respuesta
    const areasUnicas = areasConPerfiles.map((item) => item.area);
    const perfilesUnicos = areasConPerfiles.map((item) => item.perfil);

    // 5. Retornar datos sin la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      usuario: usuarioSinPassword,
      areas: areasUnicas,
      perfiles: perfilesUnicos,
    };
  } catch (error) {
    throw new Error(
      `Error al validar credenciales: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
