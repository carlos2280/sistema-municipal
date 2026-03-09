/**
 * AppLayout — Layout principal CIVITAS v3
 *
 * Estructura:
 * ┌─────────────────────────────────────────────────────┐
 * │ Sidebar (permanent/drawer)  │  AppBar (glassmorphism)│
 * │ ┌─────────────────────────┐ │  ┌──────────────────┐ │
 * │ │ Brand (logo + nombre)   │ │  │ Indicators + User│ │
 * │ │ Sistema activo selector │ │  └──────────────────┘ │
 * │ │ Menu navegación         │ │  ┌──────────────────┐ │
 * │ │ Footer CrisCar          │ │  │ Content (Outlet) │ │
 * │ └─────────────────────────┘ │  └──────────────────┘ │
 * │                             │  ┌──────────────────┐ │
 * │                             │  │ StatusBar        │ │
 * │                             │  └──────────────────┘ │
 * └─────────────────────────────────────────────────────┘
 */

import {
  Box,
  CssBaseline,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import {
  type CSSObject,
  type Theme,
  alpha,
  styled,
  useTheme,
} from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Network,
} from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector, selectSistemaId, useObtenerConversacionesQuery } from "mf_store/store";
import MainMenu from "../component/mainMenu/MainMenu";
import AccountMenu from "./AccountMenu";
import CustomizedMenus from "./CustomizedMenus";
import { EconomicIndicatorsExamples } from "./EconomicIndicatorsExamples";
import { ChatDrawerWrapper } from "../components/ChatDrawerWrapper";
import { ThemeCustomizer } from "mf_ui/components";
import { OrganigramaDialog } from "../components/organigrama/OrganigramaDialog";
import { useModuleSync } from "../hooks/useModuleSync";
import { StatusBar } from "./StatusBar";

// ============================================================================
// CONSTANTS
// ============================================================================
const DRAWER_WIDTH = 272;
const DRAWER_COLLAPSED = 72;

// ============================================================================
// MIXINS
// ============================================================================
const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: 300,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_COLLAPSED,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: 300,
  }),
  overflowX: "hidden",
});

// ============================================================================
// STYLED COMPONENTS
// ============================================================================
const SidebarDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: "hidden",
    overscrollBehavior: "contain",
    "&::-webkit-scrollbar": { width: 4 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      background: alpha(theme.palette.text.primary, 0.12),
      borderRadius: 2,
    },
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(theme.palette.text.primary, 0.12)} transparent`,
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

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5),
  minHeight: 72,
  transition: theme.transitions.create(["padding", "justify-content"], {
    duration: 300,
  }),
}));

const SidebarLogo = styled(Box)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: 10,
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #0d6b5e, #3730a3)"
      : "linear-gradient(135deg, #14b8a6, #4f46c9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontWeight: 800,
  fontSize: "1.1rem",
  letterSpacing: "-0.03em",
  flexShrink: 0,
  transition: theme.transitions.create(["width", "height", "font-size"], {
    duration: 300,
  }),
}));

const SidebarBrand = styled(Box)(() => ({
  overflow: "hidden",
  whiteSpace: "nowrap",
  transition: "opacity 200ms ease, width 300ms ease",
}));

const SidebarDivider = styled(Box)(({ theme }) => ({
  height: 1,
  backgroundColor: theme.palette.divider,
  margin: `0 ${theme.spacing(2)}`,
  transition: theme.transitions.create("margin", { duration: 300 }),
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  opacity: 0.45,
  fontSize: "0.6rem",
  color: theme.palette.text.secondary,
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  transition: "opacity 100ms ease",
  "&:hover": { opacity: 0.7 },
}));

const FooterIcon = styled(Box)(({ theme }) => ({
  width: 14,
  height: 14,
  borderRadius: 3,
  backgroundColor: theme.palette.primary.main,
  opacity: 0.6,
  flexShrink: 0,
}));

const TopBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255,255,255,0.88)"
      : "rgba(13,17,23,0.92)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: 64,
}));

const CollapseButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen",
})<{ sidebarOpen?: boolean }>(({ theme, sidebarOpen }) => ({
  position: "fixed",
  left: sidebarOpen ? DRAWER_WIDTH - 14 : DRAWER_COLLAPSED - 14,
  top: 36,
  width: 28,
  height: 28,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "50%",
  zIndex: theme.zIndex.drawer + 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: theme.transitions.create(
    ["left", "background-color", "box-shadow", "transform", "color"],
    { duration: 300 },
  ),
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    transform: "scale(1.1)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
}));

const AppBarIconBtn = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  color: theme.palette.text.secondary,
  transition: theme.transitions.create(
    ["background-color", "color", "transform"],
    { duration: 100 },
  ),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    transform: "scale(1.05)",
  },
}));

const AppBarSep = styled(Box)(({ theme }) => ({
  width: 1,
  height: 24,
  backgroundColor: theme.palette.divider,
  margin: `0 ${theme.spacing(0.5)}`,
}));

const NotifBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 4,
  right: 4,
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  fontSize: "0.55rem",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `2px solid ${theme.palette.background.paper}`,
}));

// ============================================================================
// COMPONENT
// ============================================================================
export default function AppLayout() {
  useModuleSync();
  const theme = useTheme();
  const sistemaId = useAppSelector(selectSistemaId);
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);

  // Total de mensajes no leídos para el badge del botón de chat
  const { data: conversaciones } = useObtenerConversacionesQuery() as {
    data?: { mensajesNoLeidos: number }[]
  }
  const totalUnread = conversaciones?.reduce((acc, c) => acc + (c.mensajesNoLeidos || 0), 0) ?? 0;

  const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);

  const isCollapsed = !isMobile && !drawerOpen;

  // ── Sidebar Content ─────────────────────────────────────────────
  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand Header */}
      <SidebarHeader
        sx={
          isCollapsed
            ? { padding: "20px 0", justifyContent: "center" }
            : undefined
        }
      >
        <SidebarLogo
          sx={
            isCollapsed
              ? { width: 36, height: 36, fontSize: "0.95rem" }
              : undefined
          }
        >
          MM
        </SidebarLogo>
        <SidebarBrand
          sx={
            isCollapsed
              ? { opacity: 0, width: 0, pointerEvents: "none" }
              : undefined
          }
        >
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "-0.02em",
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Muni de Pelarco
          </Typography>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: "text.secondary",
              letterSpacing: "0.02em",
            }}
          >
            Sistema Municipal
          </Typography>
        </SidebarBrand>
      </SidebarHeader>

      <SidebarDivider sx={isCollapsed ? { mx: 1 } : undefined} />

      {/* System Selector */}
      <Box
        sx={
          isCollapsed
            ? { opacity: 0, height: 0, overflow: "hidden", p: 0 }
            : { p: "12px 16px" }
        }
      >
        <Typography
          sx={{
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.disabled",
            mb: "6px",
            pl: "2px",
          }}
        >
          Sistema activo
        </Typography>
        <CustomizedMenus variant="sidebar" />
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={sistemaId ?? "no-sistema"}
            initial={{ opacity: 0, x: -28, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 28, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: "100%", overflow: "hidden" }}
          >
            <MainMenu collapsed={!isCollapsed} />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Footer */}
      <SidebarFooter
        sx={
          isCollapsed
            ? { justifyContent: "center", p: "12px 8px" }
            : undefined
        }
      >
        <FooterIcon />
        <Box
          component="span"
          sx={
            isCollapsed
              ? { opacity: 0, width: 0, overflow: "hidden" }
              : undefined
          }
        >
          Desarrollado por CrisCar
        </Box>
      </SidebarFooter>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      {!isMobile && (
        <SidebarDrawer variant="permanent" open={drawerOpen}>
          {sidebarContent}
        </SidebarDrawer>
      )}

      {/* ── Mobile Sidebar ──────────────────────────────────────── */}
      {isMobile && (
        <MuiDrawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              backgroundColor: "background.paper",
              borderRight: `1px solid ${theme.palette.divider}`,
              overscrollBehavior: "contain",
            },
            "& .MuiBackdrop-root": {
              backdropFilter: "blur(2px)",
              backgroundColor: alpha(theme.palette.common.black, 0.4),
            },
          }}
        >
          {sidebarContent}
        </MuiDrawer>
      )}

      {/* ── Collapse Button (desktop) ───────────────────────────── */}
      {!isMobile && (
        <CollapseButton
          sidebarOpen={drawerOpen}
          onClick={handleDrawerToggle}
          aria-label={drawerOpen ? "Colapsar menú (Ctrl+B)" : "Expandir menú"}
        >
          {drawerOpen ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </CollapseButton>
      )}

      {/* ── Main Area ───────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* AppBar */}
        <TopBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: 64, gap: 1.5 }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                aria-label="Abrir menú de navegación"
                edge="start"
              >
                <Menu size={20} />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Right: indicators + actions + user */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <EconomicIndicatorsExamples />
              </Box>

              <AppBarSep sx={{ display: { xs: "none", md: "block" } }} />

              <Tooltip title="Organigrama" arrow>
                <AppBarIconBtn
                  onClick={() => setOrgOpen(true)}
                  aria-label="Organigrama"
                  sx={{ display: { xs: "none", sm: "flex" } }}
                >
                  <Network size={18} />
                </AppBarIconBtn>
              </Tooltip>

              <Tooltip title="Notificaciones" arrow>
                <AppBarIconBtn
                  aria-label="Notificaciones"
                  sx={{ position: "relative" }}
                >
                  <Bell size={18} />
                  <NotifBadge>3</NotifBadge>
                </AppBarIconBtn>
              </Tooltip>

              <Tooltip title="Mensajes" arrow>
                <AppBarIconBtn
                  onClick={() => setChatDrawerOpen((p) => !p)}
                  aria-label="Mensajes"
                  sx={{ position: "relative" }}
                >
                  <MessageSquare size={18} />
                  {totalUnread > 0 && <NotifBadge>{totalUnread}</NotifBadge>}
                </AppBarIconBtn>
              </Tooltip>

              <AppBarSep />

              <AccountMenu
                onOpenCustomizer={() => setCustomizerOpen(true)}
              />
            </Box>
          </Toolbar>
        </TopBar>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            backgroundColor: "background.default",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.text.primary, 0.12),
              borderRadius: 3,
              "&:hover": {
                background: alpha(theme.palette.text.primary, 0.25),
              },
            },
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(theme.palette.text.primary, 0.12)} transparent`,
          }}
        >
          <Outlet />
        </Box>

        {/* StatusBar */}
        <StatusBar />
      </Box>

      {/* ── Side Panels ─────────────────────────────────────────── */}
      <ThemeCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
      <ChatDrawerWrapper
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      />
      <OrganigramaDialog open={orgOpen} onClose={() => setOrgOpen(false)} />
    </Box>
  );
}
