import { menus, sistemas } from "../../";
import type { DbExecutor } from "../../../types/db";

/**
 * Seed del sistema "Configuración" con su estructura de menú.
 *
 * Estructura:
 *   Configuración
 *   ├── Seguridad
 *   │   ├── Autenticación MFA          (seguridad_autenticacion_mfa)
 *   │   ├── Política de contraseñas    (seguridad_politica_contrasenas)
 *   │   └── Sesiones activas           (seguridad_sesiones_activas)
 *   └── Organización
 *       ├── Datos del municipio        (organizacion_datos_municipio)
 *       ├── Estructura organizacional  (organizacion_estructura_org)
 *       └── Usuarios y perfiles        (organizacion_usuarios_perfiles)
 */
export async function seedConfiguracion(db: DbExecutor) {
	console.log("🌱 Insertando sistema Configuración...");

	// ── 1. Sistema ────────────────────────────────────────────────────────────
	const [sistema] = await db
		.insert(sistemas)
		.values({
			nombre: "Sistema Configuración",
			icono: "settings-2",
		})
		.returning({ id: sistemas.id });

	const sistemaId = sistema.id;

	// ── 2. Menús raíz ─────────────────────────────────────────────────────────
	const [menuSeguridad] = await db
		.insert(menus)
		.values({
			idSistema: sistemaId,
			idPadre: null,
			nombre: "Seguridad",
			icono: "shield",
			componente: null,
			visible: true,
			nivel: 1,
			orden: 1,
		})
		.returning({ id: menus.id });

	const [menuOrganizacion] = await db
		.insert(menus)
		.values({
			idSistema: sistemaId,
			idPadre: null,
			nombre: "Organización",
			icono: "building-2",
			componente: null,
			visible: true,
			nivel: 1,
			orden: 2,
		})
		.returning({ id: menus.id });

	// ── 3. Hijos de Seguridad ─────────────────────────────────────────────────
	await db.insert(menus).values([
		{
			idSistema: sistemaId,
			idPadre: menuSeguridad.id,
			nombre: "Autenticación MFA",
			icono: "shield-check",
			componente: "seguridad_autenticacion_mfa",
			visible: true,
			nivel: 2,
			orden: 1,
		},
		{
			idSistema: sistemaId,
			idPadre: menuSeguridad.id,
			nombre: "Política de contraseñas",
			icono: "key-round",
			componente: "seguridad_politica_contrasenas",
			visible: true,
			nivel: 2,
			orden: 2,
		},
		{
			idSistema: sistemaId,
			idPadre: menuSeguridad.id,
			nombre: "Sesiones activas",
			icono: "monitor-check",
			componente: "seguridad_sesiones_activas",
			visible: true,
			nivel: 2,
			orden: 3,
		},
	]);

	// ── 4. Hijos de Organización ──────────────────────────────────────────────
	await db.insert(menus).values([
		{
			idSistema: sistemaId,
			idPadre: menuOrganizacion.id,
			nombre: "Datos del municipio",
			icono: "landmark",
			componente: "organizacion_datos_municipio",
			visible: true,
			nivel: 2,
			orden: 1,
		},
		{
			idSistema: sistemaId,
			idPadre: menuOrganizacion.id,
			nombre: "Estructura organizacional",
			icono: "network",
			componente: "organizacion_estructura_org",
			visible: true,
			nivel: 2,
			orden: 2,
		},
		{
			idSistema: sistemaId,
			idPadre: menuOrganizacion.id,
			nombre: "Usuarios y perfiles",
			icono: "users",
			componente: "organizacion_usuarios_perfiles",
			visible: true,
			nivel: 2,
			orden: 3,
		},
	]);

	console.log(
		`✅ seedConfiguracion insertado correctamente (sistemaId: ${sistemaId})`,
	);
}
