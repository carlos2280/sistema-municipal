/**
 * AccountMenu — Menú de Cuenta del Usuario
 *
 * Trigger compacto en AppBar: Avatar + primer nombre + chevron.
 * Dropdown: user card completo + acciones + Personalizar tema.
 */

import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import { ChevronDown, LogOut, Palette, User } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useLogoutMutation,
  useAppSelector,
  selectEmail,
  selectNombreCompleto,
} from "mf_store/store";
import { usePersistor } from "../context/PersistorContext";

// ============================================================================
// TYPES
// ============================================================================

interface AccountMenuProps {
  onOpenCustomizer?: () => void;
}

// ============================================================================
// STYLED
// ============================================================================

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius + 4,
    marginTop: theme.spacing(1),
    minWidth: 240,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
    backdropFilter: "blur(12px)",
    "& .MuiMenu-list": { padding: 0 },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: "1px 6px",
  padding: theme.spacing(1, 1.5),
  fontSize: "0.875rem",
  fontWeight: 500,
  gap: theme.spacing(1.5),
  "& .MuiListItemIcon-root": {
    minWidth: "auto",
    color: theme.palette.text.secondary,
  },
  "&:hover .MuiListItemIcon-root": {
    color: theme.palette.primary.main,
  },
}));

const TriggerButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius + 4,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
}));

const UserCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function getFirstName(name: string | null): string {
  if (!name) return "Usuario";
  return name.trim().split(/\s+/)[0];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AccountMenu({ onOpenCustomizer }: AccountMenuProps) {
  const navigate = useNavigate();
  const persistor = usePersistor();
  const [logout] = useLogoutMutation();
  const email = useAppSelector(selectEmail);
  const nombreCompleto = useAppSelector(selectNombreCompleto);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
    } catch {
      // Si el backend falla, continuar con la limpieza local
    }
    await persistor.purge();
    navigate("/login", { replace: true });
  };

  const handleOpenCustomizer = () => {
    handleClose();
    onOpenCustomizer?.();
  };

  const initials = getInitials(nombreCompleto);
  const firstName = getFirstName(nombreCompleto);

  return (
    <>
      {/* Trigger compacto: Avatar + primer nombre + chevron */}
      <Tooltip title="Opciones de cuenta" arrow>
        <TriggerButton
          onClick={handleOpen}
          role="button"
          aria-label="Abrir menú de cuenta"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.8125rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ lineHeight: 1.2, maxWidth: 110 }}
            >
              {firstName}
            </Typography>
          </Box>

          <ChevronDown
            size={14}
            strokeWidth={1.5}
            style={{
              opacity: 0.5,
              flexShrink: 0,
              transition: "transform 0.2s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </TriggerButton>
      </Tooltip>

      {/* Dropdown */}
      <StyledMenu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* User Card — nombre completo + email */}
        <UserCard>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              fontSize: "0.9375rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ lineHeight: 1.3 }}
            >
              {nombreCompleto ?? "Usuario"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {email ?? ""}
            </Typography>
          </Box>
        </UserCard>

        <Box sx={{ px: 0.75, pb: 0.75 }}>
          <Divider sx={{ mb: 0.75 }} />

          <StyledMenuItem onClick={handleClose}>
            <ListItemIcon>
              <User size={16} strokeWidth={1.5} />
            </ListItemIcon>
            Mi perfil
          </StyledMenuItem>

          <StyledMenuItem onClick={handleOpenCustomizer}>
            <ListItemIcon>
              <Palette size={16} strokeWidth={1.5} />
            </ListItemIcon>
            Personalizar tema
          </StyledMenuItem>

          <Divider sx={{ my: 0.75 }} />

          <StyledMenuItem
            onClick={handleLogout}
            sx={{
              color: "error.main",
              "&:hover": { bgcolor: (t) => alpha(t.palette.error.main, 0.08) },
              "& .MuiListItemIcon-root": { color: "error.main" },
              "&:hover .MuiListItemIcon-root": { color: "error.main" },
            }}
          >
            <ListItemIcon>
              <LogOut size={16} strokeWidth={1.5} />
            </ListItemIcon>
            Cerrar sesión
          </StyledMenuItem>
        </Box>
      </StyledMenu>
    </>
  );
}
