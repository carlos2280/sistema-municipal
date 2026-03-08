/**
 * CustomizedMenus — Selector de Sistema
 *
 * Botón compacto del AppBar para cambiar entre sistemas.
 * Estilo: text button con nombre animado + ChevronDown.
 */

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useAppSelector,
  selectSistemaId,
  useMisSistemasQuery,
  useCambiarSistemaMutation,
} from "mf_store/store";
import { Box, Typography } from "@mui/material";

// ============================================================================
// STYLED
// ============================================================================

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius + 4,
    marginTop: theme.spacing(1),
    minWidth: 220,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
    backdropFilter: "blur(12px)",
    "& .MuiMenu-list": { padding: "6px" },
    "& .MuiMenuItem-root": {
      borderRadius: theme.shape.borderRadius,
      margin: "1px 0",
      padding: theme.spacing(1, 1.5),
      fontSize: "0.875rem",
      fontWeight: 500,
      transition: "background-color 0.15s ease",
      "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        fontWeight: 600,
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.15),
        },
      },
      "&:hover": {
        backgroundColor: alpha(theme.palette.action.hover, 1),
      },
    },
  },
}));

const SistemaButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius + 2,
  padding: theme.spacing(0.75, 1.5),
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: "0.875rem",
  letterSpacing: "-0.01em",
  textTransform: "none",
  gap: theme.spacing(1),
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
  "& .MuiButton-endIcon": {
    marginLeft: 2,
    color: theme.palette.text.secondary,
    transition: "transform 0.2s ease",
  },
  "&[aria-expanded='true'] .MuiButton-endIcon": {
    transform: "rotate(180deg)",
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

// Botón estilo sidebar (dentro del drawer)
const SidebarSystemBtn = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  width: "100%",
  padding: "10px 12px",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontFamily: '"Inter", sans-serif',
  fontSize: "0.875rem",
  fontWeight: 600,
  textTransform: "none",
  justifyContent: "flex-start",
  transition: "background-color 100ms ease, border-color 100ms ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "& .MuiButton-endIcon": {
    marginLeft: "auto",
    color: theme.palette.text.disabled,
  },
}));

interface CustomizedMenusProps {
  variant?: "appbar" | "sidebar";
}

export default function CustomizedMenus({ variant = "appbar" }: CustomizedMenusProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const sistemaId = useAppSelector(selectSistemaId);
  const { data: sistemas = [] } = useMisSistemasQuery();
  const [cambiarSistema, { isLoading }] = useCambiarSistemaMutation();

  const sistemaActual = sistemas.find((s) => s.id === sistemaId);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectSistema = async (id: number) => {
    handleClose();
    if (id === sistemaId) return;
    const result = await cambiarSistema({ sistemaId: id });
    if (!("error" in result)) {
      navigate("/");
    }
  };

  const TriggerButton = variant === "sidebar" ? SidebarSystemBtn : SistemaButton;

  return (
    <>
      <TriggerButton
        id="sistemas-button"
        aria-controls={open ? "sistemas-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        disabled={isLoading}
        startIcon={
          variant === "sidebar" ? (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
                boxShadow: "0 0 0 2px rgba(5,150,105,0.2)",
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                color: "primary.main",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LayoutGrid size={16} strokeWidth={1.5} />
            </Box>
          )
        }
        endIcon={
          isLoading ? (
            <CircularProgress size={14} />
          ) : (
            <ChevronDown size={variant === "sidebar" ? 14 : 16} strokeWidth={1.5} style={variant === "sidebar" ? { opacity: 0.5 } : undefined} />
          )
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={sistemaId ?? "default"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...(variant === "appbar" ? { position: "absolute", left: 0, maxWidth: "100%" } : {}),
            }}
          >
            {sistemaActual?.nombre ?? "Seleccionar sistema"}
          </motion.span>
        </AnimatePresence>
      </TriggerButton>

      <StyledMenu
        id="sistemas-menu"
        slotProps={{ list: { "aria-labelledby": "sistemas-button" } }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {sistemas.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.disabled">
              Sin sistemas asignados
            </Typography>
          </MenuItem>
        ) : (
          sistemas.map((sistema) => (
            <MenuItem
              key={sistema.id}
              onClick={() => handleSelectSistema(sistema.id)}
              selected={sistema.id === sistemaId}
            >
              {sistema.nombre}
            </MenuItem>
          ))
        )}
      </StyledMenu>
    </>
  );
}
