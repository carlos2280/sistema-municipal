import type { JSX } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../component/ProtectedRoute";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import ContrasenaTemporal from "../pages/login/ContrasenaTemporal";
import LoginPage from "../pages/login/LoginPage";
import MfaSetupPage from "../pages/mfa-setup/MfaSetupPage";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "../utils/componentsMap";
import { generateRoutesFromMenu } from "../utils/generateRoutesFromMenu";
import { loadManifest } from "./microfrontRegistry";
import {
	isRemoteRegistered,
	type ModuleInfo,
} from "../modules/dynamicModuleLoader";
import ModuleUnavailablePage from "../pages/ModuleUnavailablePage";

interface Props {
	menuData?: MenuItem[];
	sistemaId?: number;
	modulosActivos?: ModuleInfo[];
}

export const createAppRouter = async ({
	menuData,
	sistemaId,
	modulosActivos = [],
}: Props) => {
	// ── Cargar componentes de TODOS los MFs activos ─────────────────────────
	// Loop genérico: el shell NO conoce los nombres de los MFs.
	// Solo itera modulosActivos (datos de BD) y carga cada uno que tenga mfName.
	// generateRoutesFromMenu solo matchea las claves presentes en el menú,
	// así que no hay conflicto entre componentes de distintos MFs.

	if (sistemaId && menuData) {
		const mergedComponents: Record<string, JSX.Element> = {};

		for (const mod of modulosActivos) {
			if (!mod.mfName || !isRemoteRegistered(mod.mfName)) continue;

			// Chat usa exposes individuales (ChatButton, ChatDrawer), no ./routes.
			// Intentar loadRemote("mf_chat/routes") falla y corrompe el runtime
			// de Module Federation, bloqueando los loadRemote posteriores.
			if (mod.codigo === "chat") continue;

			const manifest = await loadManifest(mod.mfName);
			if (manifest.status !== "failed") {
				Object.assign(mergedComponents, manifest.components);
			}
		}

		componentsBySistemaId[sistemaId] = mergedComponents;
	}

	const dynamicRoutes =
		sistemaId && menuData
			? generateRoutesFromMenu(menuData, sistemaId)
			: [];

	// Rutas de chat solo si el módulo está contratado y el remote registrado
	const chatActive =
		modulosActivos.some((m) => m.codigo === "chat") &&
		isRemoteRegistered("mf_chat");
	const chatRoutes = chatActive ? await buildChatRoutes() : [];

	return createBrowserRouter([
		{
			path: "/login",
			element: <LoginPage />,
		},
		{
			path: "/contrasena-temporal",
			element: <ContrasenaTemporal />,
		},
		{
			path: "/mfa-setup",
			element: <MfaSetupPage />,
		},
		{
			path: "/",
			element: <ProtectedRoute />,
			children: [
				{
					path: "/",
					element: <AppLayout />,
					children: [
						{
							index: true,
							element: <DashboardPage />,
						},
						...chatRoutes,
						...dynamicRoutes,
						{
							path: "*",
							element: <ModuleUnavailablePage />,
						},
					],
				},
			],
		},
	]);
};

/**
 * Construye las rutas de chat cargando el componente dinámicamente.
 * Se llama solo si el módulo chat está activo.
 */
async function buildChatRoutes() {
	try {
		const { default: ChatPage } = await import("../pages/ChatPage");
		return [
			{ path: "chat", element: <ChatPage /> },
			{ path: "chat/:conversacionId", element: <ChatPage /> },
		];
	} catch {
		console.warn("[Router] No se pudo cargar ChatPage");
		return [];
	}
}
