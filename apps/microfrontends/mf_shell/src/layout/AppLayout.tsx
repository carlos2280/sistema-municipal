import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Container } from "@mui/material";
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
import * as React from "react";
import { Outlet } from "react-router-dom";
import { ToggleThemeButton } from "../component/ToggleThemeBotton";
import MainMenu from "../component/mainMenu/MainMenu";
import AccountMenu from "./AccountMenu";
import CustomizedMenus from "./CustomizedMenus";
import { EconomicIndicatorsExamples } from "./EconomicIndicatorsExamples";

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

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: theme.spacing(0, 2),
	minHeight: 64,
	position: "relative",
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
	top: 30,
	transform: "translateY(-50%)",
	width: 32,
	height: 32,
	backgroundColor: theme.palette.background.paper,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: "50%",
	zIndex: theme.zIndex.drawer + 10,
	boxShadow: theme.shadows[1],
	transition: theme.transitions.create(
		["left", "transform", "background-color"],
		{
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		},
	),
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.6),
		color: theme.palette.common.white,
		transform: "translateY(-50%) scale(1.1)",
		// boxShadow: theme.shadows[6],
	},
	"& .MuiSvgIcon-root": {
		fontSize: 18,
		color: theme.palette.text.secondary,
		transition: theme.transitions.create("transform", {
			duration: theme.transitions.duration.short,
		}),
		"&:hover": {
			// backgroundColor: alpha(theme.palette.primary.main, 0.8),
			color: theme.palette.common.white,
			// transform: 'translateY(-50%) scale(1.1)',
			// boxShadow: theme.shadows[6],
		},
	},
}));

export default function MiniDrawer() {
	const theme = useTheme();
	const [open, setOpen] = React.useState(true);

	const handleDrawerToggle = () => {
		setOpen(!open);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar position="fixed" open={open}>
				<Toolbar sx={{ minHeight: 64 }}>
					<Box
						sx={{
							flexGrow: 1,
						}}
					>
						<CustomizedMenus />
					</Box>

					<EconomicIndicatorsExamples />
					<ToggleThemeButton />
					<AccountMenu />
				</Toolbar>
			</AppBar>

			<Drawer variant="permanent" open={open}>
				<DrawerHeader>
					{/* Logo o título cuando está abierto */}

					<img src="/logo_02.svg" width={60} alt="Logo Municipalidad" />
				</DrawerHeader>

				{/* <Divider /> */}
				<MainMenu collapsed={open} />
			</Drawer>

			{/* Botón de colapso circular - posicionado de forma independiente */}
			<CollapseToggleButton
				open={open}
				onClick={handleDrawerToggle}
				aria-label="toggle drawer"
			>
				{open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
			</CollapseToggleButton>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					transition: theme.transitions.create("margin", {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
				}}
			>
				<DrawerHeader />

				<Container maxWidth={false}>
					<Outlet />
				</Container>
			</Box>
		</Box>
	);
}
