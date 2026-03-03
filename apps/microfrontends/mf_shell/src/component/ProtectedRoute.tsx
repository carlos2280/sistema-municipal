import { useAppSelector, useVerificarTokenQuery } from "mf_store/store";
import { Navigate, Outlet } from "react-router-dom";
import { AppLoader } from "mf_ui/components";

const ProtectedRoute = () => {
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const { isLoading } = useVerificarTokenQuery(undefined, {
		skip: isAuthenticated,
		refetchOnReconnect: true,
	});

	// Mientras se verifica la cookie con el backend, mostrar loader
	if (!isAuthenticated && isLoading)
		return <AppLoader variant="branded" message="Verificando sesión..." />;

	// Sin autenticación (verificación completada o no iniciada): siempre al login
	if (!isAuthenticated) return <Navigate to="/login" replace />;

	return <Outlet />;
};

export default ProtectedRoute;
