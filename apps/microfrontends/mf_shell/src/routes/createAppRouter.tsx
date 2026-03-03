import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../component/ProtectedRoute";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import ContrasenaTemporal from "../pages/login/ContrasenaTemporal";
import Login from "../pages/login/Login";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "../utils/componentsMap";
import { generateRoutesFromMenu } from "../utils/generateRoutesFromMenu";
import { loadMicrofrontComponents } from "./microfrontRegistry";
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
	let dynamicRoutes: ReturnType<typeof generateRoutesFromMenu> = [];

	// Solo cargar microfrontends si hay sistemaId, menuData y el módulo activo
	if (
		sistemaId &&
		menuData &&
		activeModuleCodes.includes("contabilidad")
	) {
		const microfront = await loadMicrofrontComponents(sistemaId);

		componentsBySistemaId[sistemaId] = microfront.components;

		dynamicRoutes = generateRoutesFromMenu(menuData, sistemaId);
	}

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
