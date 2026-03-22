import { loadRemote } from "@module-federation/enhanced/runtime";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { type Theme, alpha } from "@mui/material/styles";
import { MessageSquare } from "lucide-react";
import { useTheme as useAppTheme } from "mf_ui/theme";
import { type FC, useEffect, useRef, useState } from "react";

interface ChatDrawerProps {
	open: boolean;
	onClose: () => void;
	theme?: Theme;
}

const DRAWER_WIDTH = 420;

/**
 * Wrapper para el ChatDrawer de mf_chat.
 *
 * Pre-carga el módulo remoto al montar (no al primer clic) para que cuando
 * el usuario abra el chat, el componente ya esté listo y no haya doble
 * animación open/close por swap de Drawers.
 *
 * Fallback Drawer solo se muestra si el módulo aún no cargó cuando el
 * usuario hace clic (red lenta). En ese caso, se espera a que cargue
 * sin desmontar el fallback para evitar flash.
 */
export function ChatDrawerWrapper({ open, onClose }: ChatDrawerProps) {
	const { theme } = useAppTheme();
	const [RemoteChatDrawer, setRemoteChatDrawer] =
		useState<FC<ChatDrawerProps> | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const hasAttemptedLoadRef = useRef(false);
	// Tracks whether the fallback Drawer was open when remote loaded.
	// When true, we keep showing the fallback until the user closes and reopens,
	// preventing the double open/close animation.
	const fallbackWasOpenRef = useRef(false);
	const [pendingRemote, setPendingRemote] =
		useState<FC<ChatDrawerProps> | null>(null);

	// Pre-cargar el módulo remoto inmediatamente al montar
	useEffect(() => {
		if (hasAttemptedLoadRef.current) return;
		hasAttemptedLoadRef.current = true;

		loadRemote<{
			ChatDrawer?: FC<ChatDrawerProps>;
			default?: FC<ChatDrawerProps>;
		}>("mf_chat/ChatDrawer")
			.then((mod) => {
				if (!mod) throw new Error("Módulo no disponible");
				const ChatDrawerComponent = mod.ChatDrawer || mod.default;

				if (ChatDrawerComponent) {
					setRemoteChatDrawer(() => ChatDrawerComponent);
				} else {
					console.error(
						"[ChatDrawerWrapper] No se encontró ChatDrawer en el módulo",
					);
					setLoadFailed(true);
				}
			})
			.catch((err) => {
				console.error("[ChatDrawerWrapper] Error al cargar:", err);
				setLoadFailed(true);
			});
	}, []);

	// Si el remoto se cargó mientras el fallback estaba abierto,
	// guardar como pendiente y esperar a que se cierre
	useEffect(() => {
		if (RemoteChatDrawer && fallbackWasOpenRef.current && open) {
			// Remote loaded while fallback was showing — defer the swap
			setPendingRemote(() => RemoteChatDrawer);
		}
	}, [RemoteChatDrawer, open]);

	// Cuando el drawer se cierra, aplicar el swap pendiente
	useEffect(() => {
		if (!open && pendingRemote) {
			setPendingRemote(null);
			fallbackWasOpenRef.current = false;
		}
	}, [open, pendingRemote]);

	// Si ya cargó el componente remoto Y no hay swap pendiente,
	// delegarle el Drawer completo
	if (RemoteChatDrawer && !pendingRemote) {
		return <RemoteChatDrawer open={open} onClose={onClose} theme={theme} />;
	}

	// Track que el fallback se mostró abierto
	if (open && !RemoteChatDrawer) {
		fallbackWasOpenRef.current = true;
	}

	// Mientras carga o si falló: un solo Drawer con contenido intercambiable
	const isLoading = !RemoteChatDrawer && !loadFailed;

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			transitionDuration={{ enter: 250, exit: 200 }}
			slotProps={{
				paper: {
					sx: {
						width: { xs: "100vw", sm: DRAWER_WIDTH },
						boxSizing: "border-box",
						background: alpha(theme.meridian.surfaces.ground, 0.92),
						backdropFilter: "blur(24px) saturate(1.4)",
						borderLeft: `1px solid ${theme.meridian.borders.default}`,
						color: theme.palette.text.primary,
					},
				},
			}}
		>
			<Box
				sx={{
					width: { xs: "100vw", sm: DRAWER_WIDTH },
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 2,
					p: 3,
				}}
			>
				{isLoading ? (
					<>
						<CircularProgress color="primary" />
						<Typography
							sx={{
								color: "text.secondary",
								fontFamily: '"DM Sans", sans-serif',
								fontSize: "13.5px",
							}}
						>
							Cargando chat...
						</Typography>
					</>
				) : (
					<>
						<MessageSquare size={48} color={theme.palette.text.secondary} />
						<Typography
							sx={{
								fontWeight: 600,
								fontSize: "15px",
								fontFamily: '"Bricolage Grotesque", sans-serif',
								color: "text.secondary",
								textAlign: "center",
							}}
						>
							Chat no disponible
						</Typography>
						<Typography
							sx={{
								fontSize: "13.5px",
								fontFamily: '"DM Sans", sans-serif',
								color: "text.secondary",
								textAlign: "center",
							}}
						>
							El módulo de chat no está cargado. Intenta recargar la página.
						</Typography>
					</>
				)}
			</Box>
		</Drawer>
	);
}

export default ChatDrawerWrapper;
