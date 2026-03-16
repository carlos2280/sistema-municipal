/**
 * NavPanelHeader — Cabecera del Navigation Panel
 *
 * Muestra: avatar + nombre + email del usuario, y el sistema activo
 * con opción de cambiar (abre el Compass).
 */

import { styled, alpha } from "@mui/material/styles";
import { X, ChevronRight } from "lucide-react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
	useAppSelector,
	selectNombreCompleto,
	selectEmail,
} from "mf_store/store";
import { useMenu } from "../../hooks/useMenu";

// ─── Types ──────────────────────────────────────────────────────

interface NavPanelHeaderProps {
	onClose: () => void;
	onChangeSistema?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(name: string | null): string {
	if (!name) return "U";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

// ─── Styled Components ──────────────────────────────────────────

const HeaderRoot = styled("div")(({ theme }) => ({
	padding: "20px 20px 16px",
	borderBottom: `1px solid ${theme.meridian.borders.muted}`,
}));

const TopRow = styled("div")({
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	marginBottom: 16,
});

const UserInfo = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: 12,
	flex: 1,
	minWidth: 0,
});

const AvatarCircle = styled("div")(({ theme }) => ({
	width: 40,
	height: 40,
	borderRadius: "50%",
	background: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: 14,
	fontWeight: 700,
	flexShrink: 0,
	fontFamily: theme.typography.fontFamily,
}));

const UserText = styled("div")({
	minWidth: 0,
	flex: 1,
});

const UserName = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 14,
	fontWeight: 600,
	color: theme.palette.text.primary,
	lineHeight: 1.3,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,
}));

const UserEmail = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 12,
	color: theme.palette.text.secondary,
	lineHeight: 1.3,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,
}));

const CloseButton = styled("button")(({ theme }) => ({
	border: "none",
	background: "transparent",
	padding: 4,
	borderRadius: 6,
	cursor: "pointer",
	color: theme.palette.text.secondary,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	transition: "background 150ms ease, color 150ms ease",

	"&:hover": {
		background: alpha(theme.palette.text.primary, 0.08),
		color: theme.palette.text.primary,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

const SistemaRow = styled("button")(({ theme }) => ({
	border: `1px solid ${theme.meridian.borders.default}`,
	background: theme.meridian.surfaces.s3,
	padding: "8px 12px",
	borderRadius: 8,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	gap: 10,
	width: "100%",
	font: "inherit",
	color: theme.palette.text.primary,
	transition: "background 150ms ease, border-color 150ms ease",

	"&:hover": {
		background: theme.meridian.surfaces.s4,
		borderColor: theme.palette.primary.main,
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

const SistemaIcon = styled("span")(({ theme }) => ({
	width: 28,
	height: 28,
	borderRadius: 6,
	background: alpha(theme.palette.primary.main, 0.12),
	color: theme.palette.primary.main,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
}));

const SistemaText = styled("span")({
	flex: 1,
	textAlign: "left",
	minWidth: 0,
});

const SistemaLabel = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 10,
	fontWeight: 500,
	color: theme.palette.text.disabled,
	textTransform: "uppercase",
	letterSpacing: "0.06em",
	lineHeight: 1.2,
	fontFamily: theme.typography.fontFamily,
}));

const SistemaName = styled("span")(({ theme }) => ({
	display: "block",
	fontSize: 13,
	fontWeight: 600,
	color: theme.palette.text.primary,
	lineHeight: 1.3,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontFamily: theme.typography.fontFamily,
}));

const ChevronWrap = styled("span")(({ theme }) => ({
	color: theme.palette.text.disabled,
	flexShrink: 0,
	display: "flex",
}));

// ─── Component ──────────────────────────────────────────────────

function NavPanelHeader({ onClose, onChangeSistema }: NavPanelHeaderProps) {
	const nombreCompleto = useAppSelector(selectNombreCompleto);
	const email = useAppSelector(selectEmail);
	const { nombreSistema } = useMenu();

	const initials = getInitials(nombreCompleto);

	// Intentar renderizar icono del sistema activo
	const sistemaIconName = "layout-grid"; // fallback genérico
	const pascalName = toPascalCase(sistemaIconName);
	const IconComp = (icons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascalName];

	return (
		<HeaderRoot>
			<TopRow>
				<UserInfo>
					<AvatarCircle>{initials}</AvatarCircle>
					<UserText>
						<UserName>{nombreCompleto ?? "Usuario"}</UserName>
						<UserEmail>{email ?? ""}</UserEmail>
					</UserText>
				</UserInfo>

				<CloseButton
					onClick={onClose}
					type="button"
					aria-label="Cerrar panel de navegación"
				>
					<X size={18} strokeWidth={2} />
				</CloseButton>
			</TopRow>

			<SistemaRow
				onClick={onChangeSistema}
				type="button"
				aria-label="Cambiar sistema"
			>
				<SistemaIcon>
					{IconComp ? (
						<IconComp size={16} strokeWidth={1.5} />
					) : (
						<icons.LayoutGrid size={16} strokeWidth={1.5} />
					)}
				</SistemaIcon>
				<SistemaText>
					<SistemaLabel>Sistema activo</SistemaLabel>
					<SistemaName>{nombreSistema || "Sin sistema"}</SistemaName>
				</SistemaText>
				<ChevronWrap>
					<ChevronRight size={16} strokeWidth={1.5} />
				</ChevronWrap>
			</SistemaRow>
		</HeaderRoot>
	);
}

export default NavPanelHeader;
