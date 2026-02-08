/**
 * AppLayout - Layout principal del Sistema Municipal CrisCar
 *
 * Incluye:
 * - Drawer colapsable con logo
 * - AppBar con menú de sistemas, indicadores, tema y cuenta
 * - Botón de personalización de tema integrado
 */

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
	Container,
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
import { Palette } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import MainMenu from "../component/mainMenu/MainMenu";
import AccountMenu from "./AccountMenu";
import CustomizedMenus from "./CustomizedMenus";
import { EconomicIndicatorsExamples } from "./EconomicIndicatorsExamples";
import { HeaderChatButton } from "../components/HeaderChatButton";
import { ChatDrawerWrapper } from "../components/ChatDrawerWrapper";
import { ThemeCustomizer } from "mf_ui/components";
import { useTheme as useAppTheme } from "mf_ui/theme";

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
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: theme.spacing(1.5),
	transition: theme.transitions.create(["opacity", "transform"], {
		duration: theme.transitions.duration.enteringScreen,
	}),
	"& img": {
		transition: theme.transitions.create("all", {
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
	backgroundColor: theme.palette.background.paper,
	color: theme.palette.text.primary,
	boxShadow: "none",
	borderBottom: `1px solid ${theme.palette.divider}`,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				marginLeft: drawerWidth,
				width: `calc(100% - ${drawerWidth}px)`,
				transition: theme.transitions.create(["width", "margin"], {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				marginLeft: collapsedWidth,
				width: `calc(100% - ${collapsedWidth}px)`,
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

// Botón de personalización de tema
const ThemeCustomizerButton = styled(IconButton)(({ theme }) => ({
	backgroundColor: alpha(theme.palette.primary.main, 0.08),
	borderRadius: 12,
	padding: theme.spacing(1),
	transition: theme.transitions.create(["background-color", "transform"], {
		duration: theme.transitions.duration.short,
	}),
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.16),
		transform: "rotate(15deg)",
	},
}));

// ============================================================================
// COMPONENT
// ============================================================================

export default function AppLayout() {
	const theme = useTheme();
	const { isDarkMode } = useAppTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [drawerOpen, setDrawerOpen] = useState(!isMobile);
	const [customizerOpen, setCustomizerOpen] = useState(false);
	const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleChatToggle = () => {
		setChatDrawerOpen(!chatDrawerOpen);
	};

	// Seleccionar el logo apropiado según el modo
	const logoSrc = isDarkMode ? "/logo-criscar-white.svg" : "/logo-criscar.svg";
	const logoIconSrc = "/logo-criscar-icon.svg";

	return (
		<Box sx={{ display: "flex", minHeight: "100vh" }}>
			<CssBaseline />

			{/* AppBar */}
			<AppBar position="fixed" open={drawerOpen}>
				<Toolbar sx={{ minHeight: 64, gap: 1 }}>
					<Box sx={{ flexGrow: 1 }}>
						<CustomizedMenus />
					</Box>

					<Stack direction="row" alignItems="center" spacing={1}>
						<EconomicIndicatorsExamples />

						{/* Botón de Chat */}
						<HeaderChatButton onClick={handleChatToggle} unreadCount={3} />

						{/* Botón de personalización de tema */}
						<Tooltip title="Personalizar tema" arrow>
							<ThemeCustomizerButton
								onClick={() => setCustomizerOpen(true)}
								aria-label="Personalizar tema"
							>
								<Palette size={20} />
							</ThemeCustomizerButton>
						</Tooltip>

						<AccountMenu />
					</Stack>
				</Toolbar>
			</AppBar>

			{/* Drawer lateral */}
			<Drawer variant="permanent" open={drawerOpen}>
				<DrawerHeader>
					<LogoContainer collapsed={!drawerOpen}>
						{drawerOpen ? (
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
						) : (
							<Tooltip title="Sistema Municipal CrisCar" placement="right" arrow>
								<img
									src={logoIconSrc}
									width={40}
									height={40}
									alt="Logo CrisCar"
									style={{ objectFit: "contain" }}
								/>
							</Tooltip>
						)}
					</LogoContainer>
				</DrawerHeader>

				<MainMenu collapsed={drawerOpen} />
			</Drawer>

			{/* Botón de colapso circular */}
			<CollapseToggleButton
				open={drawerOpen}
				onClick={handleDrawerToggle}
				aria-label={drawerOpen ? "Colapsar menú" : "Expandir menú"}
			>
				{drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
			</CollapseToggleButton>

			{/* Contenido principal */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					pt: 2,
					minHeight: "100vh",
					minWidth: 0, // Permite que flexbox reduzca el ancho
					overflow: "hidden", // Evita scroll horizontal a nivel de main
					backgroundColor: (theme) =>
						theme.palette.mode === "light"
							? theme.palette.grey[50]
							: theme.palette.background.default,
					transition: theme.transitions.create(["margin", "background-color"], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
				}}
			>
				{/* Spacer para el AppBar */}
				<Box sx={{ minHeight: 64 }} />

				<Box sx={{ py: 2, height: "calc(100vh - 64px - 48px)", minWidth: 0 }}>
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
		</Box>
	);
}
