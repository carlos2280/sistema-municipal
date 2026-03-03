import { RouterProvider, type RouterProviderProps } from "react-router-dom";
import "./App.css";
import {
	selectIsAuthenticated,
	selectModulosActivos,
	selectSistemaId,
	useAppSelector,
} from "mf_store/store";
import { AppLoader } from "mf_ui/components";
import { useEffect, useState } from "react";
import { useMenu } from "./hook/useMenu";
import { useTenantResolver } from "./hooks/useTenantResolver";
import { registerDynamicRemotes } from "./modules/dynamicModuleLoader";
import TenantNotFound from "./pages/TenantNotFound";
import { createAppRouter } from "./routes/createAppRouter";

function App() {
	const { status: tenantStatus } = useTenantResolver();
	const { menu } = useMenu();
	const sistemaId = useAppSelector(selectSistemaId);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const modulosActivos = useAppSelector(selectModulosActivos);
	// Estado raw del menú para saber si fue cargado (independiente del filtrado por módulos activos)
	const menuLoaded = useAppSelector((state: { menu: unknown }) => !!state.menu);
	const [router, setRouter] = useState<RouterProviderProps["router"] | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Si está autenticado pero aún no tiene menu/sistemaId, seguir esperando.
	// Usamos menuLoaded (raw) en vez de menu (filtrado) para no bloquear
	// cuando un módulo se desactiva y useMenu retorna null.
	const isWaitingForAuthData = isAuthenticated && (!sistemaId || !menuLoaded);

	useEffect(() => {
		// No crear router hasta que el tenant esté resuelto
		if (tenantStatus !== "resolved") {
			return;
		}

		// No crear router mientras esperamos datos de autenticación
		if (isWaitingForAuthData) {
			return;
		}

		const initializeRouter = async () => {
			try {
				setLoading(true);

				// Registrar remotes dinámicos de MF según módulos contratados
				// (necesario en refresh de página, ya que los remotes no persisten)
				if (isAuthenticated && modulosActivos.length > 0) {
					await registerDynamicRemotes(modulosActivos);
				}

				// Crear el router
				// - Si NO está autenticado: crea router básico (solo login)
				// - Si SÍ está autenticado: crea router con microfrontends
				const activeModuleCodes = modulosActivos.map((m) => m.codigo);
				const routerInstance = await createAppRouter({
					menuData: isAuthenticated && menu ? menu : undefined,
					sistemaId: isAuthenticated && sistemaId ? sistemaId : undefined,
					activeModuleCodes: isAuthenticated ? activeModuleCodes : [],
				});
				setRouter(routerInstance);
			} catch (err) {
				console.error("[App] Error creando router:", err);
				setError("Error al inicializar la aplicación");
			} finally {
				setLoading(false);
			}
		};

		initializeRouter();
	}, [menu, sistemaId, isAuthenticated, isWaitingForAuthData, modulosActivos, tenantStatus]);

	// Resolución de tenant en progreso
	if (tenantStatus === "loading") {
		return <AppLoader variant="branded" message="Identificando municipalidad..." />;
	}

	// Hostname no encontrado
	if (tenantStatus === "error") {
		return <TenantNotFound />;
	}

	// Mostrar loader mientras esperamos datos de autenticación
	if (isWaitingForAuthData) {
		return (
			<AppLoader variant="branded" message="Cargando datos del usuario..." />
		);
	}
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
