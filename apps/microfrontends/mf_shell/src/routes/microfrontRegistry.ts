import { loadRemote } from "@module-federation/enhanced/runtime";
import type { FC } from "react";
import {
	loadWithRetry,
	type LoadedManifest,
	type RouteManifest,
} from "../utils/mfLoader";
import { isRemoteRegistered } from "../modules/dynamicModuleLoader";

// Cache por mfName
const manifestCache = new Map<string, LoadedManifest>();

/**
 * Loader genérico — carga el RouteManifest de cualquier MF registrado.
 *
 * Usa cache + retry con backoff exponencial.
 * El shell NO necesita conocer el nombre de cada MF; simplemente
 * itera `modulosActivos` y llama `loadManifest(mod.mfName)`.
 */
export async function loadManifest(mfName: string): Promise<LoadedManifest> {
	const cached = manifestCache.get(mfName);
	if (cached?.status === "loaded") {
		console.info(`[MF Registry] Usando manifest cacheado para ${mfName}`);
		return cached;
	}

	if (!isRemoteRegistered(mfName)) {
		console.warn(`[MF Registry] ${mfName} no registrado, omitiendo carga`);
		return { sistemaId: 0, components: {}, status: "fallback" };
	}

	try {
		const start = performance.now();

		const manifest = await loadWithRetry(
			() =>
				loadRemote<{ default: RouteManifest }>(`${mfName}/routes`).then(
					(mod) => mod!.default,
				),
			{ attempts: 3, delay: 1000, moduleName: mfName },
		);

		const loadTime = performance.now() - start;

		const result: LoadedManifest = {
			...manifest,
			status: "loaded",
			loadTime,
		};

		manifestCache.set(mfName, result);
		console.info(
			`[MF Registry] ${mfName} cargado (${loadTime.toFixed(0)}ms)`,
		);

		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		console.error(`[MF Registry] Error cargando ${mfName}:`, errorMessage);

		const failed: LoadedManifest = {
			sistemaId: 0,
			components: {},
			status: "failed",
			error: errorMessage,
		};

		manifestCache.set(mfName, failed);
		return failed;
	}
}

export function clearManifestCache(): void {
	manifestCache.clear();
}

// ─── Loaders específicos de chat (exposes individuales, no ./routes) ─────────

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
