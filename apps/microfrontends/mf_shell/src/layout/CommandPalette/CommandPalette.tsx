/**
 * CommandPalette — Modal de búsqueda rápida MERIDIAN
 *
 * Modal centrado 640px con input autofocus, secciones filtradas,
 * navegación por flechas (↑↓), Enter ejecuta, Esc cierra.
 * Z-index: cmdPalette (980) sobre cmdOverlay (970).
 * Secciones: Sistemas, Menú del sistema activo, Acciones Globales.
 */

import { alpha, styled } from "@mui/material/styles";
import {
	ArrowRight,
	Home,
	LayoutGrid,
	LogOut,
	Palette,
	Search,
} from "lucide-react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
	selectSistemaId,
	useAppSelector,
	useCambiarSistemaMutation,
	useMisSistemasQuery,
} from "mf_store/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useMenu } from "../../hooks/useMenu";
import type { MenuItem } from "../../types/menu";

// ─── Types ──────────────────────────────────────────────────────

interface CommandPaletteProps {
	isOpen: boolean;
	onClose: () => void;
	onOpenCustomizer?: () => void;
}

interface PaletteItem {
	id: string;
	label: string;
	section: string;
	icon: React.ReactNode;
	action: () => void;
	keywords?: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

function SafeIcon({ name, size = 18 }: { name: string | null; size?: number }) {
	if (!name) return <LayoutGrid size={size} strokeWidth={1.5} />;
	const pascalName = toPascalCase(name);
	const IconComp = (
		icons as unknown as Record<string, React.ComponentType<LucideProps>>
	)[pascalName];
	if (!IconComp) return <LayoutGrid size={size} strokeWidth={1.5} />;
	return <IconComp size={size} strokeWidth={1.5} />;
}

/** Aplana el árbol de menú recursivo en items planos con su path */
function flattenMenu(
	items: MenuItem[],
	parentPath: string,
): { item: MenuItem; path: string }[] {
	const result: { item: MenuItem; path: string }[] = [];
	for (const item of items) {
		const slug = slugify(item.nombre, { lower: true, strict: true });
		const itemPath = parentPath ? `${parentPath}/${slug}` : slug;
		result.push({ item, path: itemPath });
		if (item.hijos.length > 0) {
			result.push(...flattenMenu(item.hijos, itemPath));
		}
	}
	return result;
}

// ─── Styled Components ──────────────────────────────────────────

const Overlay = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => ({
	position: "fixed",
	inset: 0,
	zIndex: theme.meridian.zIndex.cmdOverlay,
	background: alpha(theme.palette.common.black, 0.6),
	opacity: visible ? 1 : 0,
	pointerEvents: visible ? "all" : "none",
	transition: `opacity 200ms ${theme.meridian.easings.out}`,
}));

const PaletteRoot = styled("div", {
	shouldForwardProp: (prop) => prop !== "visible",
})<{ visible: boolean }>(({ theme, visible }) => ({
	position: "fixed",
	top: "20%",
	left: "50%",
	transform: visible
		? "translate(-50%, 0) scale(1)"
		: "translate(-50%, -12px) scale(0.98)",
	width: 640,
	maxWidth: "calc(100vw - 32px)",
	maxHeight: "min(520px, 60vh)",
	zIndex: theme.meridian.zIndex.cmdPalette,
	background: theme.meridian.surfaces.s2,
	border: `1px solid ${theme.meridian.borders.strong}`,
	borderRadius: 16,
	boxShadow: theme.meridian.shadows.lg,
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	opacity: visible ? 1 : 0,
	pointerEvents: visible ? "all" : "none",
	transition: `opacity 180ms ${theme.meridian.easings.out}, transform 180ms ${theme.meridian.easings.out}`,

	[theme.breakpoints.down("sm")]: {
		top: 16,
		width: "calc(100vw - 32px)",
		maxHeight: "calc(100vh - 32px)",
		borderRadius: 12,
	},
}));

const SearchRow = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 12,
	padding: "14px 20px",
	borderBottom: `1px solid ${theme.meridian.borders.muted}`,
}));

const SearchIcon = styled("span")(({ theme }) => ({
	color: theme.palette.text.disabled,
	display: "flex",
	flexShrink: 0,
}));

const SearchInput = styled("input")(({ theme }) => ({
	flex: 1,
	border: "none",
	background: "transparent",
	outline: "none",
	fontSize: 15,
	fontWeight: 400,
	color: theme.palette.text.primary,
	fontFamily: theme.typography.fontFamily,
	"&::placeholder": {
		color: theme.palette.text.disabled,
	},
}));

const Kbd = styled("kbd")(({ theme }) => ({
	display: "inline-block",
	padding: "2px 6px",
	borderRadius: 4,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.meridian.borders.default}`,
	fontSize: 11,
	fontFamily: theme.typography.mono.fontFamily,
	color: theme.palette.text.disabled,
	lineHeight: 1.4,
	flexShrink: 0,
}));

const ResultsContainer = styled("div")(({ theme }) => ({
	flex: 1,
	overflowY: "auto",
	padding: "8px 0",

	"&::-webkit-scrollbar": { width: 4 },
	"&::-webkit-scrollbar-track": { background: "transparent" },
	"&::-webkit-scrollbar-thumb": {
		background: alpha(theme.palette.text.primary, 0.12),
		borderRadius: 2,
	},
}));

const SectionHeader = styled("div")(({ theme }) => ({
	padding: "10px 20px 4px",
	fontSize: 10,
	fontWeight: 600,
	color: theme.palette.text.disabled,
	textTransform: "uppercase",
	letterSpacing: "0.08em",
	fontFamily: theme.typography.fontFamily,
}));

const ResultItem = styled("button", {
	shouldForwardProp: (prop) => prop !== "isHighlighted",
})<{ isHighlighted: boolean }>(({ theme, isHighlighted }) => ({
	border: "none",
	background: isHighlighted
		? alpha(theme.palette.primary.main, 0.1)
		: "transparent",
	padding: "10px 20px",
	margin: 0,
	width: "100%",
	display: "flex",
	alignItems: "center",
	gap: 12,
	cursor: "pointer",
	font: "inherit",
	fontSize: 13,
	fontWeight: 500,
	color: isHighlighted
		? theme.palette.primary.main
		: theme.palette.text.primary,
	transition: "background 80ms ease, color 80ms ease",
	textAlign: "left",
	fontFamily: theme.typography.fontFamily,

	"&:hover": {
		background: alpha(theme.palette.primary.main, 0.08),
	},

	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},
}));

const ItemIcon = styled("span")(({ theme }) => ({
	width: 32,
	height: 32,
	borderRadius: 8,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.meridian.borders.default}`,
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

const ItemHint = styled("span")(({ theme }) => ({
	fontSize: 11,
	color: theme.palette.text.disabled,
	flexShrink: 0,
	display: "flex",
	alignItems: "center",
	gap: 4,
}));

const EmptyState = styled("div")(({ theme }) => ({
	padding: "32px 20px",
	textAlign: "center",
	color: theme.palette.text.disabled,
	fontSize: 13,
	fontFamily: theme.typography.fontFamily,
}));

const FooterRow = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 16,
	padding: "10px 20px",
	borderTop: `1px solid ${theme.meridian.borders.muted}`,
	fontSize: 11,
	color: theme.palette.text.disabled,
	fontFamily: theme.typography.fontFamily,
}));

const FooterHint = styled("span")({
	display: "flex",
	alignItems: "center",
	gap: 4,
});

// ─── Component ──────────────────────────────────────────────────

function CommandPalette({
	isOpen,
	onClose,
	onOpenCustomizer,
}: CommandPaletteProps) {
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [highlightIndex, setHighlightIndex] = useState(0);

	const sistemaIdActual = useAppSelector(selectSistemaId);
	const { data: misSistemas = [] } = useMisSistemasQuery();
	const [cambiarSistema] = useCambiarSistemaMutation();
	const { menu, nombreSistema } = useMenu();

	// ── Build items list ──────────────────────────────────────────
	const allItems: PaletteItem[] = useMemo(() => {
		const items: PaletteItem[] = [];

		// Sistemas
		items.push({
			id: "sys-home",
			label: "Inicio",
			section: "Sistemas",
			icon: <Home size={16} strokeWidth={1.5} />,
			action: () => {
				navigate("/");
				onClose();
			},
			keywords: "inicio home dashboard",
		});

		for (const sis of misSistemas) {
			items.push({
				id: `sys-${sis.id}`,
				label: sis.nombre,
				section: "Sistemas",
				icon: <SafeIcon name={sis.icono ?? null} size={16} />,
				action: () => {
					if (sis.id !== sistemaIdActual) {
						cambiarSistema({ sistemaId: sis.id });
					}
					onClose();
				},
				keywords: `sistema ${sis.nombre.toLowerCase()}`,
			});
		}

		// Menú del sistema activo
		if (menu && menu.length > 0) {
			const flatItems = flattenMenu(menu, "");
			for (const { item, path } of flatItems) {
				items.push({
					id: `menu-${item.id}`,
					label: item.nombre,
					section: nombreSistema || "Menú",
					icon: <SafeIcon name={item.icono} size={16} />,
					action: () => {
						navigate(path);
						onClose();
					},
					keywords: `menu ${item.nombre.toLowerCase()}`,
				});
			}
		}

		// Acciones Globales
		items.push({
			id: "action-customizer",
			label: "Personalizar tema",
			section: "Acciones",
			icon: <Palette size={16} strokeWidth={1.5} />,
			action: () => {
				onClose();
				onOpenCustomizer?.();
			},
			keywords: "tema theme personalizar colores dark light",
		});

		items.push({
			id: "action-logout",
			label: "Cerrar sesión",
			section: "Acciones",
			icon: <LogOut size={16} strokeWidth={1.5} />,
			action: () => {
				onClose();
				navigate("/login", { replace: true });
			},
			keywords: "logout salir cerrar sesion",
		});

		return items;
	}, [
		misSistemas,
		sistemaIdActual,
		menu,
		nombreSistema,
		navigate,
		onClose,
		cambiarSistema,
		onOpenCustomizer,
	]);

	// ── Filter ────────────────────────────────────────────────────
	const filtered = useMemo(() => {
		if (!query.trim()) return allItems;
		const q = query.toLowerCase().trim();
		return allItems.filter(
			(item) =>
				item.label.toLowerCase().includes(q) || item.keywords?.includes(q),
		);
	}, [allItems, query]);

	// ── Group by section ──────────────────────────────────────────
	const grouped = useMemo(() => {
		const map = new Map<string, PaletteItem[]>();
		for (const item of filtered) {
			const existing = map.get(item.section);
			if (existing) {
				existing.push(item);
			} else {
				map.set(item.section, [item]);
			}
		}
		return map;
	}, [filtered]);

	// ── Reset on open/close ───────────────────────────────────────
	useEffect(() => {
		if (isOpen) {
			setQuery("");
			setHighlightIndex(0);
			// Autofocus con delay para la animación
			const timer = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Reset highlight when filter changes
	useEffect(() => {
		setHighlightIndex(0);
	}, [query]);

	// ── Keyboard Navigation ───────────────────────────────────────
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setHighlightIndex((prev) =>
					prev < filtered.length - 1 ? prev + 1 : 0,
				);
				return;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				setHighlightIndex((prev) =>
					prev > 0 ? prev - 1 : filtered.length - 1,
				);
				return;
			}

			if (e.key === "Enter" && filtered.length > 0) {
				e.preventDefault();
				filtered[highlightIndex]?.action();
			}
		},
		[onClose, filtered, highlightIndex],
	);

	// ── Render ────────────────────────────────────────────────────
	let flatIndex = -1;

	return (
		<>
			<Overlay visible={isOpen} onClick={onClose} />

			<PaletteRoot
				visible={isOpen}
				role="dialog"
				aria-label="Paleta de comandos"
				aria-modal="true"
				onKeyDown={handleKeyDown}
			>
				{/* Search */}
				<SearchRow>
					<SearchIcon>
						<Search size={18} strokeWidth={1.5} />
					</SearchIcon>
					<SearchInput
						ref={inputRef}
						type="text"
						placeholder="Buscar sistemas, menús, acciones..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						aria-label="Buscar"
					/>
					<Kbd>Esc</Kbd>
				</SearchRow>

				{/* Results */}
				<ResultsContainer>
					{filtered.length === 0 ? (
						<EmptyState>
							No se encontraron resultados para &ldquo;{query}&rdquo;
						</EmptyState>
					) : (
						Array.from(grouped.entries()).map(([section, sectionItems]) => (
							<div key={section}>
								<SectionHeader>{section}</SectionHeader>
								{sectionItems.map((item) => {
									flatIndex++;
									const idx = flatIndex;
									return (
										<ResultItem
											key={item.id}
											isHighlighted={idx === highlightIndex}
											onClick={item.action}
											type="button"
											onMouseEnter={() => setHighlightIndex(idx)}
										>
											<ItemIcon>{item.icon}</ItemIcon>
											<ItemLabel>{item.label}</ItemLabel>
											{idx === highlightIndex && (
												<ItemHint>
													<ArrowRight size={12} strokeWidth={1.5} />
												</ItemHint>
											)}
										</ResultItem>
									);
								})}
							</div>
						))
					)}
				</ResultsContainer>

				{/* Footer hints */}
				<FooterRow>
					<FooterHint>
						<Kbd>↑↓</Kbd> navegar
					</FooterHint>
					<FooterHint>
						<Kbd>↵</Kbd> ejecutar
					</FooterHint>
					<FooterHint>
						<Kbd>Esc</Kbd> cerrar
					</FooterHint>
				</FooterRow>
			</PaletteRoot>
		</>
	);
}

export default CommandPalette;
