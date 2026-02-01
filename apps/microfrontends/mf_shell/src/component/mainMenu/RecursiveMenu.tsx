import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
	Box,
	Divider,
	ListItemIcon,
	Paper,
	Popover,
	Tooltip,
	Typography,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { alpha, styled } from "@mui/material/styles";
import type { IconName } from "lucide-react/dynamic";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import slugify from "slugify";
import { getIconLucile } from "../../utils/IconDynamicLucile";

// interface MenuItem {
//   id: number;
//   idSistema: number;
//   idPadre: number | null;
//   nombre: string;
//   nivel: number;
//   orden: number;
//   icono: IconName;
//   createdAt: string;
//   updatedAt: string;
//   hijos: MenuItem[];
//   componente: string;
// }

interface MenuItem {
	id: number;
	idSistema: number;
	idPadre: number | null;
	nombre: string;
	nivel: number;
	orden: number;
	createdAt: string;
	updatedAt: string;
	hijos: MenuItem[];
	componente: string;
	icono: IconName;
}
interface MenuProps {
	nombreSistema: string;
	items: MenuItem[];
	collapsed?: boolean; // Nueva prop para controlar el estado colapsado
}

const MenuContainer = styled(List, {
	shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
		width: "100%",
		backgroundColor: "transparent",
		padding: collapsed ? theme.spacing(1, 0) : theme.spacing(0.5, 0),
		overflowY: "auto", // Habilitar scroll vertical
		maxHeight: "calc(100vh - 120px)", // Altura máxima (ajusta según tus necesidades)
		"&::-webkit-scrollbar": {
			width: "6px",
		},
		"&::-webkit-scrollbar-track": {
			background: theme.palette.background.paper,
		},
		"&::-webkit-scrollbar-thumb": {
			backgroundColor: alpha(theme.palette.text.primary, 0.2),
			borderRadius: "3px",
			"&:hover": {
				backgroundColor: alpha(theme.palette.text.primary, 0.4),
			},
		},
	}),
);

const BaseMenuItem = styled(ListItemButton, {
	shouldForwardProp: (prop) =>
		!["level", "ischildselected", "haschildren", "collapsed"].includes(
			prop as string
		),
})<{
	level?: number;
	ischildselected?: boolean;
	haschildren?: boolean;
	collapsed?: boolean;
}>(({ theme, level = 0, ischildselected = false, collapsed = false }) => ({
	padding:
		collapsed && level === 0
			? theme.spacing(1.5, 1)
			: level === 0
				? theme.spacing(1.5, 2)
				: theme.spacing(1.5, 2, 1.5, 4 + level * 2),
	minHeight: level === 0 ? 48 : 36,
	borderRadius: collapsed && level === 0 ? 0 : level === 0 ? 8 : 0,
	margin:
		collapsed && level === 0
			? theme.spacing(0.25, 0)
			: level === 0
				? theme.spacing(0.5, 1.5)
				: theme.spacing(0.25, 1.5, 0.25, 2),
	fontSize: "1rem",
	transition: "all 0.2s ease",
	position: "relative",
	justifyContent: collapsed && level === 0 ? "center" : "flex-start",

	// Estilos para elementos de primer nivel
	...(level === 0 && {
		backgroundColor: "transparent",
		color: theme.palette.text.primary,

		"&.Mui-selected": {
			backgroundColor: collapsed
				? alpha(theme.palette.primary.main, 0.15)
				: alpha(theme.palette.primary.main, 0.12),
			color: theme.palette.primary.main,
			fontWeight: 500,

			// Indicador lateral cuando está colapsado y seleccionado
			...(collapsed && {
				borderLeft: `3px solid ${theme.palette.primary.main}`,
				marginLeft: 0,
			}),

			"& .MuiListItemIcon-root": {
				color: theme.palette.primary.main,
			},

			"& .expand-icon": {
				color: theme.palette.primary.main,
			},
		},

		// Cuando un hijo está seleccionado
		...(ischildselected && {
			backgroundColor: collapsed
				? alpha(theme.palette.primary.main, 0.08)
				: alpha(theme.palette.primary.main, 0.12),
			color: theme.palette.primary.main,
			fontWeight: 500,

			// Indicador lateral cuando está colapsado y tiene hijo seleccionado
			...(collapsed && {
				borderLeft: `3px solid ${theme.palette.primary.main}`,
				marginLeft: 0,
			}),

			"& .MuiListItemIcon-root": {
				color: theme.palette.primary.main,
			},

			"& .expand-icon": {
				color: theme.palette.primary.main,
			},
		}),

		"&:hover": {
			backgroundColor: collapsed
				? alpha(theme.palette.primary.main, 0.12)
				: alpha(theme.palette.primary.main, 0.08),
		},
	}),

	// Estilos para elementos anidados (sub-items) - Solo visibles cuando NO está colapsado
	...(level > 0 &&
		!collapsed && {
			backgroundColor: "transparent !important",
			color: ischildselected
				? theme.palette.primary.main
				: theme.palette.text.secondary,
			marginLeft: 0,
			paddingLeft: theme.spacing(4 + level * 2),

			"&::before": {
				content: '""',
				position: "absolute",
				left: theme.spacing(2.5 + level * 2),
				top: "50%",
				transform: "translateY(-50%)",
				width: 6,
				height: 6,
				borderRadius: "50%",
				backgroundColor: ischildselected
					? theme.palette.primary.main
					: theme.palette.text.disabled,
				transition: "background-color 0.2s ease",
			},

			"&.Mui-selected": {
				backgroundColor: "transparent !important",
				color: theme.palette.primary.main,
				fontWeight: 500,

				"&::before": {
					backgroundColor: theme.palette.primary.main,
				},
			},

			"&:hover": {
				backgroundColor: "transparent !important",
				color: theme.palette.primary.main,

				"&::before": {
					backgroundColor: theme.palette.primary.main,
				},
			},
		}),

	"& .MuiListItemIcon-root": {
		minWidth: level === 0 ? (collapsed ? "auto" : 36) : 0,
		color: "inherit",
		transition: "color 0.2s ease",
		display: level === 0 ? "flex" : "none",
		justifyContent: collapsed ? "center" : "flex-start",

		"& .MuiSvgIcon-root": {
			fontSize: level === 0 ? "1.2rem" : "1rem",
		},
	},

	"& .MuiListItemText-root": {
		margin: 0,
		display: collapsed && level === 0 ? "none" : "block",

		"& .MuiListItemText-primary": {
			fontSize: "0.875rem",
			fontWeight: level === 0 ? 500 : 400,
			color: "inherit",
			lineHeight: 1.4,
		},
	},

	"& .expand-icon": {
		color: "inherit",
		opacity: 0.8,
		transition: "transform 0.2s ease, color 0.2s ease",
		marginLeft: "auto",
		display: collapsed ? "none" : "block",

		"& .MuiSvgIcon-root": {
			fontSize: "1.1rem",
		},
	},
}));

const SectionHeader = styled(Box, {
	shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
		padding: collapsed ? theme.spacing(1, 0) : theme.spacing(2, 2.5, 1, 2.5),
		display: collapsed ? "none" : "block",

		"& .section-title": {
			fontSize: "0.75rem",
			fontWeight: 600,
			color: theme.palette.text.secondary,
			textTransform: "uppercase",
			letterSpacing: "0.8px",
			margin: 0,
		},
	}),
);

const SubMenuContainer = styled(List)(({ theme }) => ({
	padding: 0,
	marginTop: theme.spacing(0.5),
}));

const PopoverContent = styled(Paper)(({ theme }) => ({
	minWidth: 180,
	maxWidth: 250,
	boxShadow:
		"0px 8px 32px rgba(0, 0, 0, 0.12), 0px 0px 8px rgba(0, 0, 0, 0.04)",
	border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
	borderRadius: 8,
	overflow: "hidden",
	backgroundColor: theme.palette.background.paper,
}));

const PopoverMenuItem = styled(ListItemButton, {
	shouldForwardProp: (prop) => prop !== "haschildren",
})<{ haschildren?: boolean }>(({ theme, haschildren }) => ({
		padding: theme.spacing(1, 1.5),
		minHeight: 36,
		fontSize: "0.875rem",
		color: theme.palette.text.primary,
		transition: "all 0.15s ease",
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",

		"&::before": {
			content: '""',
			position: "absolute",
			left: 8,
			top: "50%",
			transform: "translateY(-50%)",
			width: 4,
			height: 4,
			borderRadius: "50%",
			backgroundColor: theme.palette.text.disabled,
		},

		"&:hover": {
			backgroundColor: alpha(theme.palette.action.hover, 0.08),

			"&::before": {
				backgroundColor: theme.palette.primary.main,
			},

			"& .arrow-icon": {
				color: theme.palette.primary.main,
			},
		},

		"&.Mui-selected": {
			backgroundColor: alpha(theme.palette.primary.main, 0.08),
			color: theme.palette.primary.main,
			fontWeight: 500,

			"&::before": {
				backgroundColor: theme.palette.primary.main,
			},
		},

		"& .MuiListItemText-root": {
			margin: 0,
			paddingLeft: theme.spacing(2),
			flex: 1,
		},

		"& .MuiListItemText-primary": {
			fontSize: "0.875rem",
			fontWeight: 400,
			color: "inherit",
		},

		"& .arrow-icon": {
			color: theme.palette.text.disabled,
			fontSize: "1rem",
			transition: "color 0.15s ease",
			marginLeft: theme.spacing(1),
			display: haschildren ? "block" : "none",
		},
	}),
);

// Componente para manejar elementos individuales del popover con navegación anidada
const PopoverMenuItemWithChildren: React.FC<{
	item: MenuItem;
	basePath: string;
	currentPath?: string;
	onNavigate: (path: string) => void;
	level?: number;
}> = ({ item, basePath, currentPath, onNavigate, level = 1 }) => {
	const [nestedAnchorEl, setNestedAnchorEl] =
		React.useState<HTMLElement | null>(null);
	const [nestedOpen, setNestedOpen] = React.useState(false);
	const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const slug = slugify(item.nombre, { lower: true, strict: true });
	const itemPath = basePath ? `${basePath}/${slug}` : slug;
	const hasChildren = item.hijos && item.hijos.length > 0;
	const isSelected = currentPath === itemPath;

	const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
		if (hasChildren) {
			// Limpiar timeout previo
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}

			setNestedAnchorEl(event.currentTarget);
			setNestedOpen(true);
		}
	};

	const handleMouseLeave = () => {
		if (hasChildren) {
			// Delay para cerrar el popover anidado
			hoverTimeoutRef.current = setTimeout(() => {
				setNestedOpen(false);
				setNestedAnchorEl(null);
			}, 150);
		}
	};

	const handleNestedMouseEnter = () => {
		// Cancelar el cierre del popover anidado si el mouse entra en él
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
	};

	const handleNestedMouseLeave = () => {
		// Cerrar el popover anidado cuando el mouse sale
		setNestedOpen(false);
		setNestedAnchorEl(null);
	};

	const handleClick = () => {
		if (!hasChildren) {
			onNavigate(itemPath);
		}
	};

	React.useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	return (
		<>
			<PopoverMenuItem
				selected={isSelected}
				haschildren={hasChildren}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<ListItemText primary={item.nombre} />
				{hasChildren && <ChevronRightIcon className="arrow-icon" />}
			</PopoverMenuItem>

			{/* Popover anidado para los hijos */}
			{hasChildren && (
				<Popover
					open={nestedOpen}
					anchorEl={nestedAnchorEl}
					onClose={() => setNestedOpen(false)}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "left",
					}}
					sx={{
						"& .MuiPopover-paper": {
							ml: 0.5,
							mt: -0.5,
						},
						pointerEvents: "none", // Evita interferencias con el hover
					}}
					disableRestoreFocus
					disableScrollLock
					disableAutoFocus
					disableEnforceFocus
				>
					<PopoverContent
						onMouseEnter={handleNestedMouseEnter}
						onMouseLeave={handleNestedMouseLeave}
						sx={{ pointerEvents: "auto" }} // Restaura los eventos del mouse en el contenido
					>
						<List disablePadding>
							{item.hijos.map((child) => (
								<PopoverMenuItemWithChildren
									key={child.id}
									item={child}
									basePath={itemPath}
									currentPath={currentPath}
									onNavigate={onNavigate}
									level={level + 1}
								/>
							))}
						</List>
					</PopoverContent>
				</Popover>
			)}
		</>
	);
};

const MenuItemComponent: React.FC<{
	item: MenuItem;
	parentPath?: string;
	level?: number;
	currentPath?: string;
	collapsed?: boolean;
}> = ({ item, parentPath = "", level = 0, currentPath, collapsed = false }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const slug = slugify(item.nombre, { lower: true, strict: true });
	const itemPath = parentPath ? `${parentPath}/${slug}` : slug;
	const hasChildren = item.hijos.length > 0;

	// Estados para el popover
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [popoverOpen, setPopoverOpen] = React.useState(false);

	// Verificar si este item o alguno de sus hijos está seleccionado
	const isSelected = currentPath
		? currentPath === itemPath
		: location.pathname === itemPath;
	const isChildSelected = React.useMemo(() => {
		if (!currentPath && !location.pathname) return false;

		const checkChildren = (children: MenuItem[], path: string): boolean => {
			return children.some((child) => {
				const childPath = `${path}/${slugify(child.nombre, { lower: true, strict: true })}`;
				return (
					(currentPath
						? currentPath === childPath
						: location.pathname === childPath) ||
					(child.hijos.length > 0 && checkChildren(child.hijos, childPath))
				);
			});
		};

		return checkChildren(item.hijos, itemPath);
	}, [item.hijos, itemPath, currentPath, location.pathname]);

	const [open, setOpen] = React.useState(isSelected || isChildSelected);

	React.useEffect(() => {
		if (isSelected || isChildSelected) {
			setOpen(true);
		}
	}, [isSelected, isChildSelected]);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		if (collapsed && hasChildren && level === 0) {
			// En modo colapsado, mostrar popover para elementos con hijos
			setAnchorEl(event.currentTarget);
			setPopoverOpen(true);
		} else if (hasChildren && !collapsed) {
			// En modo expandido, toggle del collapse
			setOpen(!open);
		} else {
			// Navegar a la ruta
			navigate(itemPath);
			if (collapsed) {
				setPopoverOpen(false);
			}
		}
	};

	const handlePopoverClose = () => {
		setPopoverOpen(false);
		setAnchorEl(null);
	};

	const handleChildClick = (childPath: string) => {
		navigate(childPath);
		setPopoverOpen(false);
	};

	// Simplificamos la función para usar el nuevo componente
	const renderPopoverChildren = (children: MenuItem[], basePath: string) => {
		return children.map((child) => (
			<PopoverMenuItemWithChildren
				key={child.id}
				item={child}
				basePath={basePath}
				currentPath={currentPath || location.pathname}
				onNavigate={handleChildClick}
			/>
		));
	};

	const menuItem = (
		<BaseMenuItem
			onClick={handleClick}
			level={level}
			selected={isSelected}
			ischildselected={isChildSelected}
			haschildren={hasChildren}
			collapsed={collapsed}
			aria-expanded={hasChildren && !collapsed ? open : undefined}
		>
			{level === 0 && <ListItemIcon>{getIconLucile(item.icono)}</ListItemIcon>}

			<ListItemText primary={item.nombre} />

			{hasChildren && !collapsed && (
				<Box className="expand-icon">
					{open ? <ExpandLess /> : <ExpandMore />}
				</Box>
			)}
		</BaseMenuItem>
	);

	return (
		<>
			{/* Envolver en Tooltip solo cuando está colapsado y es nivel 0 */}
			{collapsed && level === 0 ? (
				<Tooltip title={item.nombre} placement="right" arrow>
					{menuItem}
				</Tooltip>
			) : (
				menuItem
			)}

			{/* Popover para elementos con hijos en modo colapsado */}
			{collapsed && hasChildren && level === 0 && (
				<Popover
					open={popoverOpen}
					anchorEl={anchorEl}
					onClose={handlePopoverClose}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "left",
					}}
					sx={{
						"& .MuiPopover-paper": {
							ml: 0.5,
							mt: -0.5,
						},
					}}
					disableRestoreFocus
					disableScrollLock
				>
					<PopoverContent>
						<List disablePadding>
							{renderPopoverChildren(item.hijos, itemPath)}
						</List>
					</PopoverContent>
				</Popover>
			)}

			{/* Los hijos solo se muestran cuando NO está colapsado */}
			{hasChildren && !collapsed && (
				<Collapse in={open} timeout="auto" unmountOnExit>
					<SubMenuContainer as="div" disablePadding>
						{item.hijos.map((child) => (
							<MenuItemComponent
								key={child.id}
								item={child}
								parentPath={itemPath}
								level={level + 1}
								currentPath={currentPath}
								collapsed={collapsed}
							/>
						))}
					</SubMenuContainer>
				</Collapse>
			)}
		</>
	);
};

const RecursiveMenu: React.FC<MenuProps> = ({
	items,
	nombreSistema,
	collapsed = false,
}) => {
	const location = useLocation();

	return (
		<Box
			sx={{
				width: "100%",
				color: "text.primary",
				backgroundColor: "background.paper",
				borderRadius: collapsed ? 0 : 1,
				display: "flex",
				flexDirection: "column",
				height: "100%", // Asegura que ocupe todo el espacio disponible
			}}
		>
			<SectionHeader collapsed={collapsed}>
				<Typography variant="subtitle2" className="section-title">
					{nombreSistema}
				</Typography>
			</SectionHeader>
			<Divider />
			<MenuContainer as="nav" collapsed={collapsed}>
				{items.map((item) => (
					<MenuItemComponent
						key={item.id}
						item={item}
						level={0}
						currentPath={location.pathname}
						collapsed={collapsed}
					/>
				))}
			</MenuContainer>
		</Box>
	);
};

export default RecursiveMenu;
