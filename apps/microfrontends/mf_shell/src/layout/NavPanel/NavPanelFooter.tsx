/**
 * NavPanelFooter — Pie del Navigation Panel
 *
 * Acciones: Personalizar tema + Cerrar sesión.
 */

import { alpha, styled } from "@mui/material/styles";
import { LogOut, Palette } from "lucide-react";
import { useLogoutMutation } from "mf_store/store";
import { useNavigate } from "react-router-dom";
import { usePersistor } from "../../context/PersistorContext";

// ─── Types ──────────────────────────────────────────────────────

interface NavPanelFooterProps {
	onClose: () => void;
	onOpenCustomizer?: () => void;
}

// ─── Styled Components ──────────────────────────────────────────

const FooterRoot = styled("div")(({ theme }) => ({
	borderTop: `1px solid ${theme.meridian.borders.muted}`,
	padding: "8px 12px",
	display: "flex",
	flexDirection: "column",
	gap: 2,
}));

const FooterButton = styled("button")(({ theme }) => ({
	border: "none",
	background: "transparent",
	padding: "10px 12px",
	borderRadius: 8,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	gap: 10,
	width: "100%",
	font: "inherit",
	fontSize: 13,
	fontWeight: 500,
	color: theme.palette.text.secondary,
	transition: "background 120ms ease, color 120ms ease",
	fontFamily: theme.typography.fontFamily,

	"&:hover": {
		background: alpha(theme.palette.text.primary, 0.06),
		color: theme.palette.text.primary,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},
}));

const LogoutButton = styled(FooterButton)(({ theme }) => ({
	color: theme.palette.error.main,

	"&:hover": {
		background: alpha(theme.palette.error.main, 0.08),
		color: theme.palette.error.main,
	},
}));

const IconWrap = styled("span")({
	display: "flex",
	alignItems: "center",
	flexShrink: 0,
});

// ─── Component ──────────────────────────────────────────────────

function NavPanelFooter({ onClose, onOpenCustomizer }: NavPanelFooterProps) {
	const navigate = useNavigate();
	const persistor = usePersistor();
	const [logout] = useLogoutMutation();

	const handleCustomizer = () => {
		onClose();
		onOpenCustomizer?.();
	};

	const handleLogout = async () => {
		onClose();
		try {
			await logout();
		} catch {
			// Si el backend falla, continuar con la limpieza local
		}
		await persistor.purge();
		navigate("/login", { replace: true });
	};

	return (
		<FooterRoot>
			<FooterButton onClick={handleCustomizer} type="button">
				<IconWrap>
					<Palette size={16} strokeWidth={1.5} />
				</IconWrap>
				Personalizar tema
			</FooterButton>

			<LogoutButton onClick={handleLogout} type="button">
				<IconWrap>
					<LogOut size={16} strokeWidth={1.5} />
				</IconWrap>
				Cerrar sesión
			</LogoutButton>
		</FooterRoot>
	);
}

export default NavPanelFooter;
