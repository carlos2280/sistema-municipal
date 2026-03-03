import { loadRemote } from "@module-federation/enhanced/runtime";
import type { FC } from "react";
import {
	loadWithRetry,
	getCachedModule,
	setCachedModule,
	type MicrofrontModule,
} from "../utils/mfLoader";
import { isRemoteRegistered } from "../modules/dynamicModuleLoader";

/**
 * Registry de Microfrontends — versión dinámica
 *
 * Los módulos ya no se mapean estáticamente por sistemaId.
 * Se cargan dinámicamente según los remotes registrados por
 * dynamicModuleLoader (basado en suscripciones del tenant).
 *
 * Usa loadRemote() en vez de import() porque los remotes no están
 * declarados en rsbuild.config.ts (son dinámicos).
 */

export async function loadMicrofrontComponents(
	sistemaId: number,
): Promise<MicrofrontModule> {
	const cached = getCachedModule(sistemaId);
	if (cached && cached.status === "loaded") {
		console.info(
			`[MF Registry] Usando módulo cacheado para sistemaId: ${sistemaId}`,
		);
		return cached;
	}

	if (!isRemoteRegistered("mf_contabilidad")) {
		console.warn(
			"[MF Registry] mf_contabilidad no registrado, omitiendo carga",
		);
		return { sistemaId, components: {}, status: "fallback" };
	}

	try {
		const startTime = performance.now();

		const moduleData = await loadWithRetry(
			() =>
				loadRemote<{ default: MicrofrontModule }>("mf_contabilidad/routes").then(
					(mod) => mod!.default,
				),
			{ attempts: 3, delay: 1000, moduleName: "mf_contabilidad" },
		);

		const loadTime = performance.now() - startTime;

		const result: MicrofrontModule = {
			...moduleData,
			status: "loaded",
			loadTime,
		};

		setCachedModule(sistemaId, result);

		console.info(
			`[MF Registry] mf_contabilidad cargado (${loadTime.toFixed(0)}ms)`,
		);

		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		console.error(
			"[MF Registry] Error cargando mf_contabilidad:",
			errorMessage,
		);

		const failedModule: MicrofrontModule = {
			sistemaId,
			components: {},
			status: "failed",
			error: errorMessage,
		};

		setCachedModule(sistemaId, failedModule);
		return failedModule;
	}
}

// Loaders para módulo de chat (solo si el remote está registrado)

export async function loadChatModule() {
	if (!isRemoteRegistered("mf_chat")) return null;
	try {
		const mod = await loadRemote<{ default: unknown }>("mf_chat/routes");
		return mod?.default ?? null;
	} catch (error) {
		console.error("[MF Registry] Error cargando mf_chat:", error);
		return null;
	}
}

export async function loadChatPanel() {
	if (!isRemoteRegistered("mf_chat")) return null;
	try {
		const mod = await loadRemote<{ ChatPanel: FC }>("mf_chat/ChatPanel");
		return mod?.ChatPanel ?? null;
	} catch (error) {
		console.error("[MF Registry] Error cargando ChatPanel:", error);
		return null;
	}
}

export async function loadChatButton() {
	if (!isRemoteRegistered("mf_chat")) return null;
	try {
		const mod = await loadRemote<{ ChatButton: FC }>("mf_chat/ChatButton");
		return mod?.ChatButton ?? null;
	} catch (error) {
		console.error("[MF Registry] Error cargando ChatButton:", error);
		return null;
	}
}
