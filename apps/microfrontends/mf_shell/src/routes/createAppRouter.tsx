import type { JSX } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../component/ProtectedRoute";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import ContrasenaTemporal from "../pages/login/ContrasenaTemporal";
import Login from "../pages/login/Login";
import MfaSetupPage from "../pages/mfa-setup/MfaSetupPage";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "../utils/componentsMap";
import { generateRoutesFromMenu } from "../utils/generateRoutesFromMenu";
import {
	loadConfiguracionComponents,
	loadMicrofrontComponents,
} from "./microfrontRegistry";
import { isRemoteRegistered } from "../modules/dynamicModuleLoader";
import ModuleUnavailablePage from "../pages/ModuleUnavailablePage";

interface Props {
	menuData?: MenuItem[];
	sistemaId?: number;
	activeModuleCodes?: string[];
}

export const createAppRouter = async ({
	menuData,
	sistemaId,
	activeModuleCodes = [],
}: Props) => {
	// ── Cargar componentes de microfrontends activos ───────────────────────────
	// Se acumulan en un mapa común; generateRoutesFromMenu solo matchea las
	// claves presentes en el menú activo, así que no hay conflicto entre MFs.

	if (sistemaId && menuData) {
		const mergedComponents: Record<string, JSX.Element> = {};

		// mf_contabilidad — cargado solo si el módulo está suscripto y registrado
		if (
			activeModuleCodes.includes("contabilidad") &&
			isRemoteRegistered("mf_contabilidad")
		) {
			const mf = await loadMicrofrontComponents(sistemaId);
			if (mf.status !== "failed") {
				Object.assign(mergedComponents, mf.components);
			}
		}

		// mf_configuracion — cargado si el módulo está suscripto y registrado
		if (
			activeModuleCodes.includes("configuracion") &&
			isRemoteRegistered("mf_configuracion")
		) {
			const mf = await loadConfiguracionComponents();
			if (mf.status !== "failed") {
				Object.assign(mergedComponents, mf.components);
			}
		}

		componentsBySistemaId[sistemaId] = mergedComponents;
	}

	const dynamicRoutes =
		sistemaId && menuData
			? generateRoutesFromMenu(menuData, sistemaId)
			: [];

	// Rutas de chat solo si el módulo está contratado y el remote registrado
	const chatRoutes =
		activeModuleCodes.includes("chat") && isRemoteRegistered("mf_chat")
			? await buildChatRoutes()
			: [];

	return createBrowserRouter([
		{
			path: "/login",
			element: <Login />,
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
