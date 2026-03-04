import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { UserRound } from 'lucide-react';
import { memo } from 'react';

export type OrgNodeType =
  | 'root'
  | 'direccion'
  | 'departamento'
  | 'oficina'
  | 'usuario'
  | 'currentUser'
  | 'advisory';

export interface OrgNodeData {
  label: string;
  nodeType: OrgNodeType;
  /** Nodo está en la ruta del usuario logueado */
  highlighted?: boolean;
  /** Sub-etiqueta (ej: email del usuario) */
  subtitle?: string;
}

export const OrgNode = memo(function OrgNode({ data }: NodeProps) {
  const theme = useTheme();
  const d = data as OrgNodeData;
  const { nodeType, highlighted = false } = d;
  const isDark = theme.palette.mode === 'dark';
  const isCurrentUser = nodeType === 'currentUser';
  const isRoot = nodeType === 'root';

  const styles: Record<OrgNodeType, { bg: string; border: string; color: string; fw: number }> = {
    root: {
      bg: theme.palette.primary.main,
      border: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
      fw: 700,
    },
    direccion: {
      bg: highlighted
        ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.13)
        : alpha(theme.palette.secondary.main, isDark ? 0.15 : 0.08),
      border: highlighted
        ? alpha(theme.palette.primary.main, 0.6)
        : alpha(theme.palette.secondary.main, isDark ? 0.5 : 0.4),
      color: highlighted
        ? (isDark ? theme.palette.primary.light : theme.palette.primary.dark)
        : (isDark ? theme.palette.secondary.light : theme.palette.secondary.dark),
      fw: 700,
    },
    departamento: {
      bg: highlighted
        ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.09)
        : alpha(theme.palette.info.main, isDark ? 0.12 : 0.07),
      border: highlighted
        ? alpha(theme.palette.primary.main, 0.5)
        : alpha(theme.palette.info.main, isDark ? 0.45 : 0.3),
      color: highlighted
        ? (isDark ? theme.palette.primary.light : theme.palette.primary.dark)
        : (isDark ? theme.palette.info.light : theme.palette.info.dark),
      fw: 600,
    },
    oficina: {
      bg: highlighted
        ? alpha(theme.palette.primary.main, isDark ? 0.14 : 0.07)
        : theme.palette.background.paper,
      border: highlighted
        ? alpha(theme.palette.primary.main, 0.45)
        : alpha(theme.palette.divider, 0.8),
      color: highlighted
        ? (isDark ? theme.palette.primary.light : theme.palette.primary.main)
        : theme.palette.text.secondary,
      fw: highlighted ? 600 : 400,
    },
    usuario: {
      bg: theme.palette.background.paper,
      border: theme.palette.divider,
      color: theme.palette.text.secondary,
      fw: 400,
    },
    currentUser: {
      bg: isDark
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, isDark ? 0.7 : 0.55),
      color: isDark ? theme.palette.success.light : theme.palette.success.dark,
      fw: 700,
    },
    advisory: {
      bg: alpha(theme.palette.warning.main, isDark ? 0.15 : 0.08),
      border: alpha(theme.palette.warning.main, isDark ? 0.5 : 0.4),
      color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
      fw: 600,
    },
  };

  const s = styles[nodeType] ?? styles.usuario;

  return (
    <Box
      sx={{
        width: 180,
        minHeight: 48,
        bgcolor: s.bg,
        border: `${isCurrentUser || (highlighted && nodeType !== 'oficina') ? 2 : 1.5}px solid ${s.border}`,
        // Borde izquierdo de énfasis para nodos en la ruta (excepto el usuario actual que usa glow)
        borderLeft: highlighted && !isCurrentUser
          ? `3px solid ${theme.palette.primary.main}`
          : undefined,
        borderRadius: 1.5,
        px: 1.25,
        py: 0.875,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: isCurrentUser
          ? `0 0 0 3px ${alpha(theme.palette.success.main, 0.25)}, 0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`
          : isRoot
            ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`
            : highlighted
              ? `0 1px 6px ${alpha(theme.palette.primary.main, 0.18)}`
              : `0 1px 3px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}`,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />

      {isCurrentUser && (
        <Box sx={{ color: s.color, mb: 0.25, display: 'flex', alignItems: 'center' }}>
          <UserRound size={13} />
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{
          fontWeight: s.fw,
          fontSize: isRoot ? '0.78rem' : nodeType === 'direccion' ? '0.72rem' : '0.67rem',
          color: s.color,
          lineHeight: 1.35,
          letterSpacing: '0.01em',
        }}
      >
        {d.label}
      </Typography>

      {d.subtitle && (
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontSize: '0.6rem', mt: 0.25, lineHeight: 1.2 }}
        >
          {d.subtitle}
        </Typography>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </Box>
  );
});
