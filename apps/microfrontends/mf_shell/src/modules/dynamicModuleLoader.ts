import { registerRemotes, loadRemote } from "@module-federation/enhanced/runtime";

export interface ModuleInfo {
	codigo: string;
	nombre: string;
	mfName: string | null;
	mfManifestUrlTpl: string | null;
	icono: string | null;
	apiPrefix: string;
}

// Mapa de mfName → variable de entorno VITE (fallback cuando la DB no tiene URL)
const ENV_MANIFEST_MAP: Record<string, string | undefined> = {
	mf_contabilidad: import.meta.env.VITE_MF_CONTABILIDAD_URL,
	mf_chat: import.meta.env.VITE_MF_CHAT_URL,
};

// Registro de remotes ya registrados para evitar duplicados
const registeredRemotes = new Set<string>();

/**
 * Resuelve la URL del manifest de un módulo.
 * Prioridad: env var VITE_* > mfManifestUrlTpl de la DB
 */
function resolveManifestUrl(
	mfName: string,
	mfManifestUrlTpl: string | null,
): string | null {
	return ENV_MANIFEST_MAP[mfName] || mfManifestUrlTpl || null;
}

/**
 * Registra remotes dinámicos de Module Federation basado en los módulos activos
 * del tenant. Se llama después del login y al restaurar sesión.
 */
export async function registerDynamicRemotes(
	modulosActivos: ModuleInfo[],
): Promise<void> {
	const remotesToRegister: { name: string; entry: string }[] = [];

	for (const modulo of modulosActivos) {
		if (!modulo.mfName) continue;
		if (registeredRemotes.has(modulo.mfName)) continue;

		const manifestUrl = resolveManifestUrl(
			modulo.mfName,
			modulo.mfManifestUrlTpl,
		);

		if (!manifestUrl) {
			console.warn(
				`[DynamicLoader] No se encontró URL de manifest para ${modulo.mfName}`,
			);
			continue;
		}

		remotesToRegister.push({
			name: modulo.mfName,
			entry: manifestUrl,
		});
	}

	if (remotesToRegister.length === 0) return;

	try {
		registerRemotes(remotesToRegister, { force: false });

		for (const remote of remotesToRegister) {
			registeredRemotes.add(remote.name);
		}

		console.info(
			`[DynamicLoader] Remotes registrados: ${remotesToRegister.map((r) => r.name).join(", ")}`,
		);
	} catch (err) {
		console.error("[DynamicLoader] Error registrando remotes:", err);
	}
}

/**
 * Carga un módulo remoto dinámico por su expose path.
 * Ejemplo: loadDynamicModule<RouteObject[]>("mf_contabilidad/routes")
 */
export async function loadDynamicModule<T = unknown>(
	id: string,
): Promise<T | null> {
	try {
		const module = await loadRemote<T>(id);
		return module;
	} catch (err) {
		console.error(`[DynamicLoader] Error cargando ${id}:`, err);
		return null;
	}
}

/**
 * Verifica si un remote específico ya fue registrado.
 */
export function isRemoteRegistered(mfName: string): boolean {
	return registeredRemotes.has(mfName);
}
