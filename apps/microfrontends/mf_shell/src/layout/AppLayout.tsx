/**
 * AppLayout - Layout principal del Sistema Municipal CrisCar
 *
 * Incluye:
 * - Drawer colapsable con logo
 * - AppBar con menú de sistemas, indicadores, tema y cuenta
 * - Botón de personalización de tema integrado
 */

import {
	Stack,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import MuiAppBar, {
	type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import {
	type CSSObject,
	type Theme,
	alpha,
	styled,
	useTheme,
} from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, Network } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector, selectSistemaId } from "mf_store/store";
import MainMenu from "../component/mainMenu/MainMenu";
import AccountMenu from "./AccountMenu";
import CustomizedMenus from "./CustomizedMenus";
import { EconomicIndicatorsExamples } from "./EconomicIndicatorsExamples";
import { HeaderChatButton } from "../components/HeaderChatButton";
import { ChatDrawerWrapper } from "../components/ChatDrawerWrapper";
import { ThemeCustomizer } from "mf_ui/components";
import { OrganigramaDialog } from "../components/organigrama/OrganigramaDialog";
import { useTheme as useAppTheme } from "mf_ui/theme";
import { useModuleSync } from "../hooks/useModuleSync";

const drawerWidth = 280;
const collapsedWidth = 88;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: collapsedWidth,
});

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: theme.spacing(2),
	minHeight: 72,
	position: "relative",
}));

const LogoContainer = styled(Box, {
	shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: theme.spacing(1.5),
	transition: theme.transitions.create(["opacity", "transform"], {
		duration: theme.transitions.duration.enteringScreen,
	}),
	"& img": {
		// ✅ Propiedades explícitas — nunca transition: all
		transition: theme.transitions.create(["width", "height", "opacity"], {
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
}));

const LogoText = styled(Typography)(({ theme }) => ({
	fontWeight: 700,
	fontSize: "1.1rem",
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
	letterSpacing: "-0.02em",
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
	backgroundColor:
		theme.palette.mode === "light"
			? "rgba(255,255,255,0.85)"
			: "rgba(15,23,42,0.9)",
	backdropFilter: "blur(12px)",
	WebkitBackdropFilter: "blur(12px)",
	color: theme.palette.text.primary,
	boxShadow: "none",
	borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				// Solo en desktop: ajustar margen al drawer expandido
				[theme.breakpoints.up("lg")]: {
					marginLeft: drawerWidth,
					width: `calc(100% - ${drawerWidth}px)`,
					transition: theme.transitions.create(["width", "margin"], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.enteringScreen,
					}),
				},
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				// Solo en desktop: ajustar margen al drawer colapsado
				[theme.breakpoints.up("lg")]: {
					marginLeft: collapsedWidth,
					width: `calc(100% - ${collapsedWidth}px)`,
				},
			},
		},
	],
}));

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	"& .MuiDrawer-paper": {
		backgroundColor: theme.palette.background.paper,
		borderRight: `1px solid ${theme.palette.divider}`,
		overflowX: "hidden",
		overscrollBehavior: "contain",
		// Scrollbar personalizado
		"&::-webkit-scrollbar": { width: 4 },
		"&::-webkit-scrollbar-track": { background: "transparent" },
		"&::-webkit-scrollbar-thumb": {
			background: alpha(theme.palette.text.primary, 0.15),
			borderRadius: 2,
			"&:hover": { background: alpha(theme.palette.text.primary, 0.3) },
		},
		scrollbarWidth: "thin",
		scrollbarColor: `${alpha(theme.palette.text.primary, 0.15)} transparent`,
	},
	variants: [
		{
			props: ({ open }) => open,
			style: {
				...openedMixin(theme),
				"& .MuiDrawer-paper": openedMixin(theme),
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				...closedMixin(theme),
				"& .MuiDrawer-paper": closedMixin(theme),
			},
		},
	],
}));

// Botón de colapso/expansión estilizado
const CollapseToggleButton = styled(IconButton, {
	shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
	position: "fixed",
	left: open ? drawerWidth - 16 : collapsedWidth - 16,
	top: 36,
	transform: "translateY(-50%)",
	width: 32,
	height: 32,
	backgroundColor: theme.palette.background.paper,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: "50%",
	zIndex: theme.zIndex.drawer + 10,
	boxShadow: theme.shadows[2],
	transition: theme.transitions.create(
		["left", "transform", "background-color", "box-shadow"],
		{
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		},
	),
	"&:hover": {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		transform: "translateY(-50%) scale(1.1)",
		boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
	},
	"& .MuiSvgIcon-root": {
		fontSize: 18,
		transition: theme.transitions.create(["color"], {
			duration: theme.transitions.duration.short,
		}),
	},
}));

// Estilo base para todos los IconButton del AppBar — usar en cualquier botón del header
const AppBarIconButton = styled(IconButton)(({ theme }) => ({
	borderRadius: 10,
	padding: theme.spacing(1),
	color: theme.palette.text.secondary,
	transition: theme.transitions.create(["background-color", "color", "transform"], {
		duration: theme.transitions.duration.short,
	}),
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.08),
		color: theme.palette.primary.main,
		transform: "scale(1.05)",
	},
}));

// ============================================================================
// COMPONENT
// ============================================================================

export default function AppLayout() {
	useModuleSync();
	const theme = useTheme();
	const { isDarkMode } = useAppTheme();
	const sistemaId = useAppSelector(selectSistemaId);
	// Desktop: lg+. Mobile/tablet: < lg (drawer temporal)
	const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

	// Desktop: empieza expandido. Mobile: empieza cerrado (temporal)
	const [drawerOpen, setDrawerOpen] = useState(!isMobile);
	const [customizerOpen, setCustomizerOpen] = useState(false);
	const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
	const [orgOpen, setOrgOpen] = useState(false);

	const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);
	const handleChatToggle = () => setChatDrawerOpen((prev) => !prev);

	const logoSrc = isDarkMode ? "/logo-criscar-white.svg" : "/logo-criscar.svg";
	const logoIconSrc = "/logo-criscar-icon.svg";

	// En desktop colapsado muestra solo el ícono; en cualquier otro caso, logo completo
	const isCollapsed = !isMobile && !drawerOpen;

	const drawerContent = (
		<>
			<DrawerHeader>
				<LogoContainer>
					{isCollapsed ? (
						<Tooltip title="Sistema Municipal CrisCar" placement="right" arrow>
							<img
								src={logoIconSrc}
								width={40}
								height={40}
								alt="Logo CrisCar"
								style={{ objectFit: "contain" }}
							/>
						</Tooltip>
					) : (
						<>
							<img
								src={logoSrc}
								width={48}
								height={48}
								alt="Logo CrisCar"
								style={{ objectFit: "contain" }}
							/>
							<Box>
								<LogoText variant="h6">CrisCar</LogoText>
								<Typography
									variant="caption"
									sx={{
										color: "text.secondary",
										fontSize: "0.65rem",
										display: "block",
										lineHeight: 1.2,
									}}
								>
									Sistema Municipal
								</Typography>
							</Box>
						</>
					)}
				</LogoContainer>
			</DrawerHeader>

			<AnimatePresence mode="wait">
				<motion.div
					key={sistemaId ?? "no-sistema"}
					initial={{ opacity: 0, x: -28, scale: 0.97 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{ opacity: 0, x: 28, scale: 0.97 }}
					transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
				>
					<MainMenu collapsed={!isCollapsed} />
				</motion.div>
			</AnimatePresence>
		</>
	);

	return (
		<Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
			<CssBaseline />

			{/* AppBar */}
			<AppBar position="fixed" open={!isMobile && drawerOpen}>
				<Toolbar sx={{ minHeight: 64, gap: 1 }}>
					{/* Hamburger — solo en mobile/tablet */}
					{isMobile && (
						<IconButton
							onClick={handleDrawerToggle}
							aria-label="Abrir menú de navegación"
							edge="start"
							sx={{ mr: 1 }}
						>
							<Menu size={20} strokeWidth={1.5} />
						</IconButton>
					)}

					{/* Zona izquierda: contexto del sistema */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<CustomizedMenus />
						<Tooltip title="Ver organigrama" arrow>
							<AppBarIconButton
								onClick={() => setOrgOpen(true)}
								aria-label="Abrir organigrama"
							>
								<Network size={18} strokeWidth={1.5} />
							</AppBarIconButton>
						</Tooltip>
					</Box>

					{/* Spacer */}
					<Box sx={{ flexGrow: 1 }} />

					{/* Zona derecha: indicadores + acciones de usuario */}
					<Stack direction="row" alignItems="center" spacing={0.5}>
						{/* Indicadores económicos — inline */}
						<Box sx={{ display: { xs: "none", md: "flex" } }}>
							<EconomicIndicatorsExamples />
						</Box>

						{/* Separador sutil */}
						<Box
							sx={{
								width: 1,
								height: 24,
								bgcolor: "divider",
								mx: 0.5,
								display: { xs: "none", md: "block" },
							}}
						/>

						<HeaderChatButton onClick={handleChatToggle} unreadCount={3} />

						{/* Separador sutil */}
						<Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 0.5 }} />

						<AccountMenu onOpenCustomizer={() => setCustomizerOpen(true)} />
					</Stack>
				</Toolbar>
			</AppBar>

			{/* Desktop: drawer permanente colapsable */}
			{!isMobile && (
				<Drawer variant="permanent" open={drawerOpen}>
					{drawerContent}
				</Drawer>
			)}

			{/* Mobile/Tablet: drawer temporal */}
			{isMobile && (
				<MuiDrawer
					variant="temporary"
					open={drawerOpen}
					onClose={handleDrawerToggle}
					ModalProps={{ keepMounted: true }}
					sx={{
						"& .MuiDrawer-paper": {
							width: drawerWidth,
							backgroundColor: "background.paper",
							borderRight: `1px solid ${theme.palette.divider}`,
							overscrollBehavior: "contain",
							"&::-webkit-scrollbar": { width: 4 },
							"&::-webkit-scrollbar-track": { background: "transparent" },
							"&::-webkit-scrollbar-thumb": {
								background: alpha(theme.palette.text.primary, 0.15),
								borderRadius: 2,
							},
						},
						"& .MuiBackdrop-root": {
							backdropFilter: "blur(2px)",
							backgroundColor: alpha(theme.palette.common.black, 0.3),
						},
					}}
				>
					{drawerContent}
				</MuiDrawer>
			)}

			{/* Botón de colapso circular — solo en desktop */}
			{!isMobile && (
				<CollapseToggleButton
					open={drawerOpen}
					onClick={handleDrawerToggle}
					aria-label={drawerOpen ? "Colapsar menú" : "Expandir menú"}
				>
					{drawerOpen
						? <ChevronLeft size={18} strokeWidth={1.5} />
						: <ChevronRight size={18} strokeWidth={1.5} />
					}
				</CollapseToggleButton>
			)}

			{/* Contenido principal */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					height: "100vh",
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					backgroundColor: (t) =>
						t.palette.mode === "light"
							? t.palette.grey[50]
							: t.palette.background.default,
					transition: theme.transitions.create("background-color", {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
				}}
			>
				{/* Spacer para el AppBar fijo */}
				<Box sx={{ minHeight: 64, flexShrink: 0 }} />

				{/* Área de contenido con scroll propio */}
				<Box
					sx={{
						flex: 1,
						p: { xs: 2, sm: 3, lg: 3 },
						overflowY: "auto",
						overflowX: "hidden",
						overscrollBehavior: "contain",
						minWidth: 0,
						"&::-webkit-scrollbar": { width: 6 },
						"&::-webkit-scrollbar-track": { background: "transparent" },
						"&::-webkit-scrollbar-thumb": {
							background: alpha(theme.palette.text.primary, 0.12),
							borderRadius: 3,
							"&:hover": { background: alpha(theme.palette.text.primary, 0.25) },
						},
						scrollbarWidth: "thin",
						scrollbarColor: `${alpha(theme.palette.text.primary, 0.12)} transparent`,
					}}
				>
					<Outlet />
				</Box>
			</Box>

			{/* Theme Customizer Drawer */}
			<ThemeCustomizer
				open={customizerOpen}
				onClose={() => setCustomizerOpen(false)}
			/>

			{/* Chat Drawer */}
			<ChatDrawerWrapper
				open={chatDrawerOpen}
				onClose={() => setChatDrawerOpen(false)}
			/>

			{/* Organigrama Dialog */}
			<OrganigramaDialog
				open={orgOpen}
				onClose={() => setOrgOpen(false)}
			/>
		</Box>
	);
}
