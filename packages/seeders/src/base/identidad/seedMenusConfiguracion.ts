import { eq } from "drizzle-orm";
import { menus, sistemas } from "@municipal/db-identidad";
import type { DbExecutor } from "../../types/db";

/**
 * Menus del sistema Configuracion.
 * Idempotente: verifica existencia por sistemaId antes de insertar.
 */
export async function seedMenusConfiguracion(db: DbExecutor): Promise<void> {
  process.stdout.write("  seedMenusConfiguracion: verificando sistema...\n");

  const [sistema] = await db
    .select({ id: sistemas.id })
    .from(sistemas)
    .where(eq(sistemas.codigo, "configuracion"));

  if (!sistema) {
    process.stdout.write("  seedMenusConfiguracion: sistema 'configuracion' no existe, saltando\n");
    return;
  }

  const sistemaId = sistema.id;

  const existentes = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.idSistema, sistemaId));

  if (existentes.length > 0) {
    process.stdout.write(`  seedMenusConfiguracion: ya existen ${existentes.length} menus, saltando\n`);
    return;
  }

  const [menuSeguridad] = await db
    .insert(menus)
    .values({ idSistema: sistemaId, idPadre: null, nombre: "Seguridad", icono: "shield", componente: null, visible: true, nivel: 1, orden: 1 })
    .returning({ id: menus.id });

  const [menuOrganizacion] = await db
    .insert(menus)
    .values({ idSistema: sistemaId, idPadre: null, nombre: "Organización", icono: "building-2", componente: null, visible: true, nivel: 1, orden: 2 })
    .returning({ id: menus.id });

  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuSeguridad.id, nombre: "Autenticación MFA", icono: "shield-check", componente: "seguridad_autenticacion_mfa", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuSeguridad.id, nombre: "Política de contraseñas", icono: "key-round", componente: "seguridad_politica_contrasenas", visible: true, nivel: 2, orden: 2 },
    { idSistema: sistemaId, idPadre: menuSeguridad.id, nombre: "Sesiones activas", icono: "monitor-check", componente: "seguridad_sesiones_activas", visible: true, nivel: 2, orden: 3 },
  ]);

  await db.insert(menus).values([
    { idSistema: sistemaId, idPadre: menuOrganizacion.id, nombre: "Datos del municipio", icono: "landmark", componente: "organizacion_datos_municipio", visible: true, nivel: 2, orden: 1 },
    { idSistema: sistemaId, idPadre: menuOrganizacion.id, nombre: "Estructura organizacional", icono: "network", componente: "organizacion_estructura_org", visible: true, nivel: 2, orden: 2 },
    { idSistema: sistemaId, idPadre: menuOrganizacion.id, nombre: "Usuarios y perfiles", icono: "users", componente: "organizacion_usuarios_perfiles", visible: true, nivel: 2, orden: 3 },
  ]);

  process.stdout.write("  seedMenusConfiguracion: menus insertados correctamente\n");
}
