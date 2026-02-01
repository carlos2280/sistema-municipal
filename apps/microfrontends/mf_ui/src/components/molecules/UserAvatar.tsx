/**
 * User Avatar - Molécula
 *
 * Avatar de usuario con iniciales, imagen y estado
 */

import {
  Avatar,
  Badge,
  Box,
  Stack,
  Tooltip,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type StatusType = "online" | "offline" | "away" | "busy";

interface UserAvatarProps {
  /** Nombre del usuario (para iniciales y tooltip) */
  name?: string;
  /** URL de la imagen */
  src?: string;
  /** Tamaño del avatar */
  size?: AvatarSize;
  /** Estado del usuario */
  status?: StatusType;
  /** Si debe mostrar el nombre al lado */
  showName?: boolean;
  /** Subtítulo (rol, cargo, etc.) */
  subtitle?: string;
  /** Color de fondo personalizado */
  color?: string;
  /** Icono en lugar de iniciales */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================

const sizeConfig: Record<AvatarSize, { avatar: number; fontSize: string; badge: number }> = {
  xs: { avatar: 24, fontSize: "0.65rem", badge: 6 },
  sm: { avatar: 32, fontSize: "0.75rem", badge: 8 },
  md: { avatar: 40, fontSize: "0.875rem", badge: 10 },
  lg: { avatar: 56, fontSize: "1.125rem", badge: 12 },
  xl: { avatar: 80, fontSize: "1.5rem", badge: 14 },
};

// ============================================================================
// STATUS COLORS
// ============================================================================

const statusColors: Record<StatusType, string> = {
  online: "#10b981",
  offline: "#94a3b8",
  away: "#f59e0b",
  busy: "#ef4444",
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) =>
    !["avatarSize", "clickable", "bgColor"].includes(prop as string),
})<{
  avatarSize: AvatarSize;
  clickable: boolean;
  bgColor?: string;
}>(({ theme, avatarSize, clickable, bgColor }) => {
  const config = sizeConfig[avatarSize];

  return {
    width: config.avatar,
    height: config.avatar,
    fontSize: config.fontSize,
    fontWeight: 600,
    backgroundColor: bgColor || theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transition: "all 0.2s ease-in-out",
    ...(clickable && {
      cursor: "pointer",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: `0 4px 12px ${alpha(bgColor || theme.palette.primary.main, 0.4)}`,
      },
    }),
  };
});

const StatusBadge = styled(Badge, {
  shouldForwardProp: (prop) =>
    !["statusColor", "badgeSize"].includes(prop as string),
})<{
  statusColor: string;
  badgeSize: number;
}>(({ statusColor, badgeSize }) => ({
  "& .MuiBadge-badge": {
    width: badgeSize,
    height: badgeSize,
    borderRadius: "50%",
    backgroundColor: statusColor,
    border: "2px solid white",
    boxShadow: `0 0 0 2px ${statusColor}20`,
  },
}));

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#7928ca", // primary
    "#0891b2", // secondary
    "#059669", // success
    "#d97706", // warning
    "#0284c7", // info
    "#7c3aed", // violet
    "#db2777", // pink
    "#ea580c", // orange
  ];

  return colors[Math.abs(hash) % colors.length];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UserAvatar({
  name = "Usuario",
  src,
  size = "md",
  status,
  showName = false,
  subtitle,
  color,
  icon,
  onClick,
}: UserAvatarProps) {
  const config = sizeConfig[size];
  const bgColor = color || stringToColor(name);
  const initials = getInitials(name);

  const avatarElement = (
    <StyledAvatar
      src={src}
      avatarSize={size}
      clickable={!!onClick}
      bgColor={bgColor}
      onClick={onClick}
    >
      {icon || (!src && initials)}
    </StyledAvatar>
  );

  const avatarWithStatus = status ? (
    <StatusBadge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      variant="dot"
      statusColor={statusColors[status]}
      badgeSize={config.badge}
    >
      {avatarElement}
    </StatusBadge>
  ) : (
    avatarElement
  );

  const avatarWithTooltip = !showName ? (
    <Tooltip title={name} arrow>
      {avatarWithStatus}
    </Tooltip>
  ) : (
    avatarWithStatus
  );

  if (!showName) {
    return avatarWithTooltip;
  }

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {avatarWithStatus}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant={size === "lg" || size === "xl" ? "subtitle1" : "body2"}
          fontWeight={600}
          noWrap
        >
          {name}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default UserAvatar;
