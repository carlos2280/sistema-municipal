import { platformDb } from "@/app";
import { loadEnv } from "@/config/env";
import { createTenantDbClient, type DbClient } from "@/db/client";
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
import {
  modulos,
  municipalidades,
  suscripciones,
} from "@municipal/shared/database/platform";
import bcrypt from "bcryptjs";
import { and, eq, gt, inArray, isNull, or } from "drizzle-orm";

const env = loadEnv();

type LoginProps = {
  correo: string;
  contrasena: string;
  areaId: number;
  sistemaId: number;
  tenantSlug?: string;
};

export const login = async ({
  correo,
  contrasena,
  areaId,
  sistemaId,
  tenantSlug = "default",
}: LoginProps) => {
  try {
    // 1. Resolver tenant desde platform DB
    const [tenant] = await platformDb
      .select({
        id: municipalidades.id,
        slug: municipalidades.slug,
        nombre: municipalidades.nombre,
        dbName: municipalidades.dbName,
        activo: municipalidades.activo,
      })
      .from(municipalidades)
      .where(eq(municipalidades.slug, tenantSlug));

    if (!tenant) {
      throw new Error("Municipalidad no encontrada");
    }

    if (!tenant.activo) {
      throw new Error("Municipalidad inactiva");
    }

    // 2. Crear conexión dinámica al tenant DB
    const tenantDb = createTenantDbClient(tenant.dbName, env);

    // 3. Buscar usuario por correo (en tenant DB)
    const [usuario]: Usuario[] = await tenantDb
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, correo));

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 4. Comparar contraseñas
    const passwordValida = await bcrypt.compare(contrasena, usuario.password);
    if (!passwordValida) {
      throw new Error("Contraseña incorrecta");
    }
    const areaValida = await validarAreasUsuario(tenantDb, usuario.id, areaId);
    if (!areaValida) {
      throw new Error("No se encontraron areas");
    }

    // 5. Obtener módulos activos del tenant desde platform DB
    const modulosActivos = await platformDb
      .select({
        codigo: modulos.codigo,
        nombre: modulos.nombre,
        mfName: modulos.mfName,
        mfManifestUrlTpl: modulos.mfManifestUrlTpl,
        icono: modulos.icono,
        apiPrefix: modulos.apiPrefix,
      })
      .from(suscripciones)
      .innerJoin(modulos, eq(modulos.id, suscripciones.moduloId))
      .innerJoin(
        municipalidades,
        eq(municipalidades.id, suscripciones.municipalidadId),
      )
      .where(
        and(
          eq(municipalidades.slug, tenantSlug),
          eq(municipalidades.activo, true),
          inArray(suscripciones.estado, ["activa", "trial"]),
          or(
            isNull(suscripciones.fechaFin),
            gt(suscripciones.fechaFin, new Date()),
          ),
        ),
      );

    // 6. Generar tokens con tenant info
    const tokens = generarTokens({
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      areaId,
      sistemaId,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantDbName: tenant.dbName,
    });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
      },
      modulosActivos,
      ...tokens,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al iniciar sesión",
    );
  }
};

export const obtenerAreasUsuario = async (
  db: DbClient,
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
  db: DbClient,
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
  db: DbClient,
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

export const obtenerSistemasDelUsuario = async (
  db: DbClient,
  userId: number,
  areaId: number,
) => {
  const perfilAreaData = await db.query.perfilAreaUsuario.findFirst({
    where: and(
      eq(perfilAreaUsuario.usuarioId, userId),
      eq(perfilAreaUsuario.areaId, areaId),
    ),
  });

  if (!perfilAreaData) return [];

  return db
    .select({
      id: sistemas.id,
      nombre: sistemas.nombre,
      icono: sistemas.icono,
    })
    .from(sistemaPerfil)
    .innerJoin(sistemas, eq(sistemaPerfil.sistemaId, sistemas.id))
    .where(eq(sistemaPerfil.perfilId, perfilAreaData.perfilId));
};

export const cambiarSistema = async (
  db: DbClient,
  userId: number,
  areaId: number,
  sistemaId: number,
  tenantSlug: string,
  tenantId: number,
  userEmail: string,
  userNombre: string,
) => {
  // 1. Validar que el usuario tiene acceso al sistema solicitado
  const sistemasUsuario = await obtenerSistemasDelUsuario(db, userId, areaId);
  const tieneAcceso = sistemasUsuario.some((s) => s.id === sistemaId);
  if (!tieneAcceso) throw new Error("No tienes acceso a este sistema");

  // 2. Obtener dbName del tenant para re-emitir el token
  const [tenant] = await platformDb
    .select({ dbName: municipalidades.dbName, slug: municipalidades.slug })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!tenant) throw new Error("Tenant no encontrado");

  // 3. Re-emitir tokens con el nuevo sistemaId
  const tokens = generarTokens({
    id: userId,
    email: userEmail,
    nombreCompleto: userNombre,
    areaId,
    sistemaId,
    tenantId,
    tenantSlug: tenant.slug,
    tenantDbName: tenant.dbName,
  });

  // 4. Obtener el menú del nuevo sistema
  const menu = await obtenerMenuPorSistema(db, sistemaId);

  return { tokens, menu };
};

interface MenuJerarquico extends Menu {
  hijos?: MenuJerarquico[];
}

export const obtenerMenuPorSistema = async (
  db: DbClient,
  idSistema: number,
) => {
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

    if (todosLosMenus.length === 0) return { nombreSistema, menuRaiz: [] };

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

export const cambiarContrasenaTemporal = async (
  db: DbClient,
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

    // Crear conexión dinámica al tenant DB desde el payload del refresh token
    const tenantDb = createTenantDbClient(
      payload.tenantDbName || "muni_default",
      env,
    );

    // Buscar usuario en la base de datos del tenant
    const [usuario] = await tenantDb
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

    // Generar nuevo par de tokens (mantener tenant context del refresh token)
    const tokens = generarTokens({
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      areaId: payload.areaId,
      sistemaId: payload.sistemaId,
      tenantId: payload.tenantId || 0,
      tenantSlug: payload.tenantSlug || "default",
      tenantDbName: payload.tenantDbName || "muni_default",
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
export const obtenerUsuarioPorId = async (db: DbClient, userId: number) => {
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
