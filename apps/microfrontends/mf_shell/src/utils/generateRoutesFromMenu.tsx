import slugify from "slugify";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "./componentsMap";
import { MicrofrontendErrorBoundary } from "../components/errors";

interface Route {
	path: string;
	element?: React.ReactNode;
	children?: Route[];
}

/**
 * Genera rutas de React Router desde la estructura de menú de BD
 * Envuelve cada componente en un Error Boundary para aislamiento de fallos
 */
export function generateRoutesFromMenu(
	menu: MenuItem[],
	sistemaId = 2,
): Route[] {
	const components = componentsBySistemaId[sistemaId] ?? {};

	if (!menu || menu.length === 0) {
		console.warn("[Routes] ⚠️ Menu vacío, no se generarán rutas");
		return [];
	}

	return menu.map((item) => {
		const path = slugify(item.nombre, { lower: true, strict: true });
		const isValidComponentKey = item.componente && item.componente !== "null";
		const foundComponent = isValidComponentKey
			? components[item.componente]
			: undefined;

		if (isValidComponentKey && !foundComponent) {
			console.warn(
				`[Routes] ❌ Componente no encontrado: "${item.componente}" para sistemaId ${sistemaId}`,
			);
		}

		const route: Route = {
			path,
			children: generateRoutesFromMenu(item.hijos, sistemaId),
		};

		// Envolver componente en Error Boundary para aislamiento de fallos
		if (foundComponent) {
			route.element = (
				<MicrofrontendErrorBoundary
					microfrontendName={item.componente}
					onRetry={() => {
						// Forzar recarga del componente
						window.location.reload();
					}}
				>
					{foundComponent}
				</MicrofrontendErrorBoundary>
			);
		}

		return route;
	});
}
