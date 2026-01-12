import { useAppSelector, useVerficarTokenQuery } from "mf_store/store";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const { isLoading, isError } = useVerficarTokenQuery(undefined, {
		skip: isAuthenticated,
		refetchOnReconnect: true,
	});

	if (!isAuthenticated && isLoading)
		return <div>Cargando verificación de sesión...</div>;

	if (!isAuthenticated && (isError || !document.hasFocus())) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
