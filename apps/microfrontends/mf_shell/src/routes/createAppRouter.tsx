// src/routes/createAppRouter.ts
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../component/ProtectedRoute";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import ChatPage from "../pages/ChatPage";
import ContrasenaTemporal from "../pages/login/ContrasenaTemporal";
import Login from "../pages/login/Login";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "../utils/componentsMap";
// import { filterRoutesByMenu } from "../utils/filterRoutesByMenu";
import { generateRoutesFromMenu } from "../utils/generateRoutesFromMenu";
import { loadMicrofrontComponents } from "./microfrontRegistry";
// import { loadMicrofrontRoutes } from "./microfrontRegistry";
// const contabilidadRoutes = await import('contabilidad/routes').then(mod => mod.default);

interface Props {
	menuData?: MenuItem[];
	sistemaId?: number;
}

export const createAppRouter = async ({ menuData, sistemaId }: Props) => {
	let dynamicRoutes: ReturnType<typeof generateRoutesFromMenu> = [];

	// Solo cargar microfrontends si hay sistemaId y menuData
	if (sistemaId && menuData) {
		const microfront = await loadMicrofrontComponents(sistemaId);

		componentsBySistemaId[sistemaId] = microfront.components;

		dynamicRoutes = generateRoutesFromMenu(menuData, sistemaId);
	} else {
		console.warn("⚠️ Skipping microfrontend loading - no sistemaId or menuData");
	}

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
						{
							path: "chat",
							element: <ChatPage />,
						},
						{
							path: "chat/:conversacionId",
							element: <ChatPage />,
						},
						...dynamicRoutes,
					],
				},
			],
		},
	]);
};
