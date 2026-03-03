import { selectModulosActivos, useAppSelector } from "mf_store/store";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ModuleGuardProps {
	moduleCodigo: string;
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * Protege componentes/rutas que requieren un módulo contratado.
 * Si el módulo no está en modulosActivos, muestra un fallback.
 */
export function ModuleGuard({
	moduleCodigo,
	children,
	fallback,
}: ModuleGuardProps) {
	const modulosActivos = useAppSelector(selectModulosActivos);
	const isActive = modulosActivos.some((m) => m.codigo === moduleCodigo);

	if (!isActive) {
		return (
			fallback ?? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						gap: 2,
						p: 4,
					}}
				>
					<Typography variant="h6" color="text.secondary">
						Módulo no disponible
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Este módulo no está contratado para su municipalidad.
					</Typography>
				</Box>
			)
		);
	}

	return <>{children}</>;
}
