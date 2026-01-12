import { db } from "@/app";
import {
  type Menu,
  type Usuario,
  areas,
  menus,
  perfilAreaUsuario,
  sistemaPerfil,
  sistemas,
  tokensContrasenaTemporal,
  usuarios,
} from "@/db/schemas";
import { generarTokens, verificarToken } from "@/libs/utils/jwt.utils";
import type { TokenPayload } from "@/libs/utils/jwt.utils";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
type LoginProps = {
  correo: string;
  contrasena: string;
  areaId: number;
  sistemaId: number;
};

export const login = async ({
  correo,
  contrasena,
  areaId,
  sistemaId,
}: LoginProps) => {
  try {
    // Buscar usuario por correo
    const [usuario]: Usuario[] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, correo));

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Comparar contraseñas
    const passwordValida = await bcrypt.compare(contrasena, usuario.password);
    if (!passwordValida) {
      throw new Error("Contraseña incorrecta");
    }
    const areaValida = await validarAreasUsuario(usuario.id, areaId);
    if (!areaValida) {
      throw new Error("No se encontraron areas");
    }

    // Obtener menú del usuario
    // const menu = await obtenerMenuPorUsuarioYArea(usuario.id, areaId);
    // Generar tokens (access + refresh)
    const tokens = generarTokens({
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      areaId,
      sistemaId,
    });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
      },
      ...tokens,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al iniciar sesión",
    );
  }
};

export const obtenerAreasUsuario = async (
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

    // 3. Obtener áreas del usuario a través de perfilAreaUsuario
    const areasUsuario = await db
      .select({
        id: areas.id,
        nombre: areas.nombre,
      })
      .from(perfilAreaUsuario)
      .innerJoin(areas, eq(perfilAreaUsuario.areaId, areas.id))
      .where(eq(perfilAreaUsuario.usuarioId, usuario.id));

    // 4. Retornar datos sin la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      usuario: usuarioSinPassword,
      areas: areasUsuario, // Solo áreas directas
    };
  } catch (error) {
    throw new Error(
      `Error al validar credenciales: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Función auxiliar para validar áreas de un usuario desde perfilAreaUsuario
export const validarAreasUsuario = async (
  usuarioId: number,
  areaId: number,
) => {
  try {
    const perfilArea = await db.query.perfilAreaUsuario.findFirst({
      where: and(
        eq(perfilAreaUsuario.usuarioId, usuarioId),
        eq(perfilAreaUsuario.areaId, areaId),
      ),
      with: {
        area: true, // Esto funciona gracias a la relación que definiste en perfilAreaUsuarioRelations
      },
    });
    return perfilArea?.area || null;
  } catch (error) {
    throw new Error(
      `Error al validar áreas del usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const obtenerSistemasPorAreaUsuario = async (
  correo: string,
  contrasena: string,
  areaId: number,
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

    // 3. Obtener el perfil_id de la tabla perfil_area_usuario para el área y usuario dados
    const perfilAreaUsuarioData = await db.query.perfilAreaUsuario.findFirst({
      where: and(
        eq(perfilAreaUsuario.areaId, areaId),
        eq(perfilAreaUsuario.usuarioId, usuario.id),
      ),
    });

    if (!perfilAreaUsuarioData) {
      throw new Error("No se encontró relación entre el área y el usuario");
    }

    // 4. Obtener los sistemas asociados al perfil_id encontrado
    const sistemasData = await db
      .select({
        id: sistemas.id,
        nombre: sistemas.nombre,
      })
      .from(sistemaPerfil)
      .innerJoin(sistemas, eq(sistemaPerfil.sistemaId, sistemas.id))
      .where(eq(sistemaPerfil.perfilId, perfilAreaUsuarioData.perfilId));

    return sistemasData;
  } catch (error) {
    throw new Error(
      `Error al obtener sistemas: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

interface MenuJerarquico extends Menu {
  hijos?: MenuJerarquico[];
}

export const obtenerMenuPorSistema = async (idSistema: number) => {
  try {
    // 1. Obtener todos los menús del sistema especificado

    const sistema = await db
      .select({ nombre: sistemas.nombre })
      .from(sistemas)
      .where(eq(sistemas.id, idSistema))
      .limit(1);

    const nombreSistema = sistema[0]?.nombre || "Sistema";
    const todosLosMenus = await db
      .select()
      .from(menus)
      .where(
        and(
          eq(menus.idSistema, idSistema),
          // eq(menus.visible, true)
        ),
      )
      .orderBy(menus.orden);

    if (todosLosMenus.length === 0) return [];

    // 2. Crear mapa de id -> item con hijos
    const menuMap = new Map<number, MenuJerarquico>();

    for (const menu of todosLosMenus) {
      menuMap.set(menu.id, { ...menu, hijos: [] });
    }

    // 3. Construir la jerarquía
    const menuRaiz: MenuJerarquico[] = [];

    for (const menu of todosLosMenus) {
      const item = menuMap.get(menu.id);
      if (!item) continue;

      if (menu.idPadre && menuMap.has(menu.idPadre)) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        menuMap.get(menu.idPadre)!.hijos!.push(item);
      } else {
        menuRaiz.push(item);
      }
    }

    return { nombreSistema, menuRaiz };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al obtener el menú por sistema",
    );
  }
};

// Función auxiliar para validar áreas de un usuario desde perfilAreaUsuario
export const cambiarContrasenaTemporal = async (
  contrasenaTemporal: string,
  nuevaContrasena: string,
  email: string,
  token: string,
) => {
  console.log("cambiarContrasenaTemporal", { token });
  if (!email || !contrasenaTemporal || !nuevaContrasena) {
    throw new Error("Credenciales inválidas");
  }

  try {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));
    if (!usuario || !usuario.passwordTemp) {
      throw new Error("Usuario no válido o ya actualizó la contraseña");
    }

    const coincide = await bcrypt.compare(contrasenaTemporal, usuario.password);
    if (!coincide) {
      throw new Error("Contraseña temporal incorrecta");
    }
    const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
    // await db.update(usuarios)
    //   .set({ password: nuevaHash, passwordTemp: false })
    //   .where(eq(usuarios.id, usuario.id));

    // await db.update(tokensContrasenaTemporal)
    //   .set({ usado: true })
    //   .where(eq(tokensContrasenaTemporal.token, token));

    await db.transaction(async (tx) => {
      await tx
        .update(usuarios)
        .set({ password: nuevaHash, passwordTemp: false })
        .where(eq(usuarios.id, usuario.id));

      await tx
        .update(tokensContrasenaTemporal)
        .set({ usado: true })
        .where(eq(tokensContrasenaTemporal.token, token));
    });
    return { success: true, mensaje: "Contraseña actualizada correctamente" };
  } catch (error) {
    throw new Error(
      `Error al validar áreas del usuario: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Refrescar access token usando refresh token
 * @param refreshToken Refresh token válido
 * @returns Nuevo par de tokens
 */
export const refrescarToken = async (refreshToken: string) => {
  try {
    // Verificar el refresh token
    const payload = verificarToken(refreshToken) as TokenPayload | null;

    if (!payload) {
      throw new Error("Refresh token inválido o expirado");
    }

    // Validar que sea un refresh token
    if (payload.tipo !== "refresh") {
      throw new Error("El token proporcionado no es un refresh token");
    }

    // Buscar usuario en la base de datos
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, payload.userId));

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new Error("Usuario inactivo");
    }

    // Generar nuevo par de tokens
    const tokens = generarTokens({
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      areaId: payload.areaId,
      sistemaId: payload.sistemaId,
    });

    return tokens;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al refrescar token",
    );
  }
};

/**
 * Obtener usuario por ID con sus relaciones
 * @param userId ID del usuario
 * @returns Usuario con sus datos completos (sin contraseña)
 */
export const obtenerUsuarioPorId = async (userId: number) => {
  try {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, userId),
      columns: {
        password: false, // Excluir contraseña del resultado
      },
      with: {
        oficina: true, // Incluir datos de la oficina
      },
    });

    return usuario;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al obtener datos del usuario",
    );
  }
};
