/**
 * NavPanelMenu — Menú recursivo del Navigation Panel (estilo MERIDIAN)
 *
 * Renderiza el árbol de menú del sistema activo con sub-items expandibles.
 * Usa Collapse de MUI para animaciones suaves.
 * Los ítems de nivel 0 tienen icono Lucide; niveles internos usan dot indicator.
 */

import Collapse from "@mui/material/Collapse";
import { alpha, styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import slugify from "slugify";
import type { MenuItem } from "../../types/menu";

// ─── Types ──────────────────────────────────────────────────────

interface NavPanelMenuProps {
	items: MenuItem[];
	nombreSistema: string;
	/** Cerrar el NavPanel después de navegar */
	onNavigate?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

function SafeIcon({ name, size = 18 }: { name: string | null; size?: number }) {
	if (!name) return <icons.LayoutGrid size={size} strokeWidth={1.5} />;
	const pascalName = toPascalCase(name);
	const IconComp = (
		icons as unknown as Record<string, React.ComponentType<LucideProps>>
	)[pascalName];
	if (!IconComp) return <icons.LayoutGrid size={size} strokeWidth={1.5} />;
	return <IconComp size={size} strokeWidth={1.5} />;
}

function buildPath(parentPath: string, nombre: string): string {
	const slug = slugify(nombre, { lower: true, strict: true });
	return parentPath ? `${parentPath}/${slug}` : slug;
}

function isChildActive(
	children: MenuItem[],
	basePath: string,
	currentPath: string,
): boolean {
	return children.some((child) => {
		const childPath = buildPath(basePath, child.nombre);
		return (
			currentPath === childPath ||
			(child.hijos.length > 0 &&
				isChildActive(child.hijos, childPath, currentPath))
		);
	});
}

// ─── Styled Components ──────────────────────────────────────────

const MenuRoot = styled("nav")({
	flex: 1,
	overflowY: "auto",
	overflowX: "hidden",
	padding: "8px 0",
});

const SectionLabel = styled("div")(({ theme }) => ({
	padding: "12px 20px 6px",
	fontSize: 10,
	fontWeight: 600,
	color: theme.palette.text.disabled,
	textTransform: "uppercase",
	letterSpacing: "0.08em",
	fontFamily: theme.typography.fontFamily,
}));

const ItemButton = styled("button", {
	shouldForwardProp: (prop) =>
		!["level", "isActive", "hasChildActive"].includes(prop as string),
})<{ level: number; isActive: boolean; hasChildActive: boolean }>(
	({ theme, level, isActive, hasChildActive }) => ({
		border: "none",
		background: "transparent",
		padding: level === 0 ? "10px 20px" : `8px 20px 8px ${28 + level * 16}px`,
		margin: 0,
		width: "100%",
		display: "flex",
		alignItems: "center",
		gap: level === 0 ? 10 : 8,
		cursor: "pointer",
		font: "inherit",
		fontSize: level === 0 ? 13 : 13,
		fontWeight: isActive || hasChildActive ? 600 : level === 0 ? 500 : 400,
		color: isActive
			? theme.palette.primary.main
			: hasChildActive
				? theme.palette.primary.main
				: level === 0
					? theme.palette.text.primary
					: theme.palette.text.secondary,
		borderRadius: 0,
		position: "relative",
		transition: "background 120ms ease, color 120ms ease",
		textAlign: "left",
		lineHeight: 1.4,
		fontFamily: theme.typography.fontFamily,

		// Active indicator bar (left edge)
		...(isActive && {
			"&::before": {
				content: '""',
				position: "absolute",
				left: 0,
				top: 4,
				bottom: 4,
				width: 3,
				borderRadius: "0 2px 2px 0",
				background: theme.palette.primary.main,
			},
		}),

		// Sub-item dot indicator
		...(level > 0 && {
			"&::after": {
				content: '""',
				position: "absolute",
				left: 12 + level * 16,
				top: "50%",
				transform: "translateY(-50%)",
				width: 5,
				height: 5,
				borderRadius: "50%",
				background: isActive
					? theme.palette.primary.main
					: theme.palette.text.disabled,
				transition: "background 120ms ease",
			},
		}),

		"&:hover": {
			background: alpha(theme.palette.primary.main, 0.06),
			color: isActive ? theme.palette.primary.main : theme.palette.text.primary,

			...(level > 0 && {
				"&::after": {
					background: theme.palette.primary.main,
				},
			}),
		},

		"&:focus-visible": {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	}),
);

const ItemIcon = styled("span")(({ theme }) => ({
	width: 20,
	height: 20,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	color: "inherit",
}));

const ItemLabel = styled("span")({
	flex: 1,
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
});

const ExpandIcon = styled("span", {
	shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ theme, expanded }) => ({
	display: "flex",
	alignItems: "center",
	flexShrink: 0,
	color: theme.palette.text.disabled,
	transition: "transform 200ms ease",
	transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
}));

const ChildrenContainer = styled("div")({
	// Wrapper para Collapse
});

// ─── MenuItem Component ─────────────────────────────────────────

interface MenuItemNodeProps {
	item: MenuItem;
	parentPath: string;
	level: number;
	onNavigate?: () => void;
}

function MenuItemNode({
	item,
	parentPath,
	level,
	onNavigate,
}: MenuItemNodeProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const itemPath = buildPath(parentPath, item.nombre);
	const hasChildren = item.hijos.length > 0;

	const isActive = location.pathname === itemPath;
	const hasChildActive = useMemo(
		() =>
			hasChildren
				? isChildActive(item.hijos, itemPath, location.pathname)
				: false,
		[hasChildren, item.hijos, itemPath, location.pathname],
	);

	const [expanded, setExpanded] = useState(isActive || hasChildActive);

	// Auto-expand when child becomes active
	useEffect(() => {
		if (isActive || hasChildActive) setExpanded(true);
	}, [isActive, hasChildActive]);

	const handleClick = useCallback(() => {
		if (hasChildren) {
			setExpanded((prev) => !prev);
		} else {
			navigate(itemPath);
			onNavigate?.();
		}
	}, [hasChildren, navigate, itemPath, onNavigate]);

	return (
		<>
			<ItemButton
				onClick={handleClick}
				level={level}
				isActive={isActive}
				hasChildActive={hasChildActive}
				type="button"
				aria-expanded={hasChildren ? expanded : undefined}
			>
				{level === 0 && (
					<ItemIcon>
						<SafeIcon name={item.icono} size={18} />
					</ItemIcon>
				)}
				<ItemLabel>{item.nombre}</ItemLabel>
				{hasChildren && (
					<ExpandIcon expanded={expanded}>
						<ChevronDown size={14} strokeWidth={1.5} />
					</ExpandIcon>
				)}
			</ItemButton>

			{hasChildren && (
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<ChildrenContainer>
						{item.hijos.map((child) => (
							<MenuItemNode
								key={child.id}
								item={child}
								parentPath={itemPath}
								level={level + 1}
								onNavigate={onNavigate}
							/>
						))}
					</ChildrenContainer>
				</Collapse>
			)}
		</>
	);
}

// ─── Component ──────────────────────────────────────────────────

function NavPanelMenu({ items, nombreSistema, onNavigate }: NavPanelMenuProps) {
	return (
		<MenuRoot aria-label={`Menú de ${nombreSistema}`}>
			<SectionLabel>{nombreSistema}</SectionLabel>
			{items.map((item) => (
				<MenuItemNode
					key={item.id}
					item={item}
					parentPath=""
					level={0}
					onNavigate={onNavigate}
				/>
			))}
		</MenuRoot>
	);
}

export default NavPanelMenu;
