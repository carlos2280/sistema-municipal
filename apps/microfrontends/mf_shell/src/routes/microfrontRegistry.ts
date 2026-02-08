import {
	loadWithRetry,
	getCachedModule,
	setCachedModule,
	type MicrofrontModule,
} from "../utils/mfLoader";

/**
 * Registry de Microfrontends
 * Carga módulos remotos con retry logic, caching y fallbacks
 */

// Mapeo de sistemaId a nombre de módulo para mejor debugging
const SISTEMA_MODULE_MAP: Record<number, string> = {
	1: "mf_contabilidad",
	2: "mf_contabilidad",
	// Chat es un módulo transversal (no asociado a un sistema específico)
	// Se carga bajo demanda cuando se abre el panel de chat
	// Agregar más sistemas según se necesiten:
	// 3: "mf_rrhh",
	// 4: "mf_tesoreria",
};

// Loader para módulo de chat (transversal)
export async function loadChatModule() {
	try {
		const chatRoutes = await import("mf_chat/routes");
		return chatRoutes.default;
	} catch (error) {
		console.error("[MF Registry] Error cargando mf_chat:", error);
		return null;
	}
}

// Loader para ChatPanel (componente standalone)
export async function loadChatPanel() {
	try {
		const { ChatPanel } = await import("mf_chat/ChatPanel");
		return ChatPanel;
	} catch (error) {
		console.error("[MF Registry] Error cargando ChatPanel:", error);
		return null;
	}
}

// Loader para ChatButton (botón de header)
export async function loadChatButton() {
	try {
		const { ChatButton } = await import("mf_chat/ChatButton");
		return ChatButton;
	} catch (error) {
		console.error("[MF Registry] Error cargando ChatButton:", error);
		return null;
	}
}

export async function loadMicrofrontComponents(
	sistemaId: number
): Promise<MicrofrontModule> {
	// Verificar cache primero
	const cached = getCachedModule(sistemaId);
	if (cached && cached.status === "loaded") {
		console.info(`[MF Registry] 📦 Usando módulo cacheado para sistemaId: ${sistemaId}`);
		return cached;
	}

	const moduleName = SISTEMA_MODULE_MAP[sistemaId];

	if (!moduleName) {
		console.warn(`[MF Registry] ⚠️ No hay módulo registrado para sistemaId: ${sistemaId}`);
		return {
			sistemaId,
			components: {},
			status: "fallback",
		};
	}

	try {
		const startTime = performance.now();

		const moduleData = await loadWithRetry(
			() => import("mf_contabilidad/routes").then((mod) => mod.default),
			{
				attempts: 3,
				delay: 1000,
				moduleName,
			}
		);

		const loadTime = performance.now() - startTime;

		const result: MicrofrontModule = {
			...moduleData,
			status: "loaded",
			loadTime,
		};

		// Guardar en cache
		setCachedModule(sistemaId, result);

		console.info(
			`[MF Registry] ✅ ${moduleName} cargado correctamente (${loadTime.toFixed(0)}ms)`
		);

		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		console.error(`[MF Registry] ❌ Error cargando ${moduleName}:`, errorMessage);

		const failedModule: MicrofrontModule = {
			sistemaId,
			components: {},
			status: "failed",
			error: errorMessage,
		};

		// Cachear también los fallos para evitar reintentos constantes
		setCachedModule(sistemaId, failedModule);

		return failedModule;
	}
}
