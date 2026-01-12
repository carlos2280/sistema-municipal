import type { RouteObject } from "react-router-dom";
// import ContabilidadLayout from '../layout/ContabilidadLayout';
import PlanDeCuentas from "../page/planDeCuentas/PlanDeCuentas";
// import Presupuesto from "../page/presupuesto/Presupuesto";

export const routes: RouteObject = {
	path: "contabilidad",
	//element: <ContabilidadLayout />, // Layout propio del microfront
	children: [
		// { index: true, element: <PlanDeCuentas /> },
		// { path: "presupuesto-app", element: <Presupuesto /> },
		{ path: "plan-de-cuentas", element: <PlanDeCuentas /> },
		{
			path: "presupuesto",
			children: [
				{
					path: "inicial", // Ruta por defecto cuando se accede a /plan-de-cuentas-app
					element: <h1>Inicial</h1>,
				},
				{
					path: "actualizaciones", // Ejemplo de ruta con parámetro
					element: <h1>Actualizaciones</h1>,
				},
				{
					path: "informes", // Ejemplo de otra ruta hija
					element: <h1>Informes</h1>,
				},
			],
		},
	],
};
export default routes;
