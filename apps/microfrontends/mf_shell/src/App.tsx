import { RouterProvider, type RouterProviderProps } from "react-router-dom";
import "./App.css";
import {
	selectIsAuthenticated,
	selectSistemaId,
	useAppSelector,
} from "mf_store/store";
import { AppLoader } from "mf_ui/components";
import { useEffect, useState } from "react";
import { useMenu } from "./hook/useMenu";
import { createAppRouter } from "./routes/createAppRouter";

function App() {
	const { menu } = useMenu();
	const sistemaId = useAppSelector(selectSistemaId);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const [router, setRouter] = useState<RouterProviderProps["router"] | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initializeRouter = async () => {
			try {
				setLoading(true);

				// Si está autenticado, esperar a que haya sistemaId y menú antes de crear router
				if (isAuthenticated) {
					if (!sistemaId || !menu) {
						setLoading(false);
						return;
					}
				}

				// Crear el router
				// - Si NO está autenticado: crea router básico (solo login)
				// - Si SÍ está autenticado: crea router con microfrontends
				const routerInstance = await createAppRouter({
					menuData: isAuthenticated && menu ? menu : undefined,
					sistemaId: isAuthenticated && sistemaId ? sistemaId : undefined,
				});
				setRouter(routerInstance);
			} catch (err) {
				setError("Failed to initialize application");
			} finally {
				setLoading(false);
			}
		};

		initializeRouter();
	}, [menu, sistemaId, isAuthenticated]);

	if (loading) {
		return <AppLoader variant="branded" message="Iniciando aplicación..." />;
	}
	if (error) {
		return (
			<AppLoader
				variant="minimal"
				message="Error al inicializar la aplicación"
			/>
		);
	}
	if (!router) {
		return <AppLoader variant="minimal" message="Configurando rutas..." />;
	}

	return <RouterProvider router={router} />;
}

export default App;
