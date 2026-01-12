import slugify from "slugify";
import type { MenuItem } from "../types/menu";
import { componentsBySistemaId } from "./componentsMap";

interface Route {
	path: string;
	element?: React.ReactNode;
	children?: Route[];
}

export function generateRoutesFromMenu(
	menu: MenuItem[],
	sistemaId = 2,
): Route[] {
	const components = componentsBySistemaId[sistemaId] ?? {};

	if (!menu || menu.length === 0) {
		console.warn("⚠️ Menu is empty, no routes will be generated");
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
				`❌ Componente no encontrado: "${item.componente}" para sistemaId ${sistemaId}`,
			);
		}

		const route: Route = {
			path,
			children: generateRoutesFromMenu(item.hijos, sistemaId),
		};

		if (foundComponent) {
			route.element = foundComponent;
		}

		console.log({ route });

		return route;
	});
}
