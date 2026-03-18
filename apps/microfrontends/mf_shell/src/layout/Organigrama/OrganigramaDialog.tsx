import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import { OrganigramaFlow } from './OrganigramaFlow';

// ============================================================================
// Leyenda
// ============================================================================

const LEGEND = [
  { label: 'Municipalidad', color: '#1976d2', shape: 'circle' },
  { label: 'Dirección', color: '#26c6da', shape: 'circle' },
  { label: 'Departamento', color: '#29b6f6', shape: 'circle' },
  { label: 'Oficina', color: '#90a4ae', shape: 'circle' },
  { label: 'Usuario', color: '#b0bec5', shape: 'circle' },
  { label: 'Tú (sesión activa)', color: '#4caf50', shape: 'circle' },
  { label: 'Tu ruta jerárquica', color: '#1976d2', shape: 'line' },
] as const;

// ============================================================================
// Transición
// ============================================================================

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ============================================================================
// Componente
// ============================================================================

interface Props {
  open: boolean;
  onClose: () => void;
}

export function OrganigramaDialog({ open, onClose }: Props) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      {/* AppBar principal */}
      <AppBar
        position="relative"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            Organigrama Municipal
          </Typography>
          <Tooltip title="Cerrar" arrow>
            <IconButton onClick={onClose} aria-label="Cerrar organigrama" edge="end">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Barra de leyenda */}
      <Box
        sx={{
          px: 3,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.common.white, 0.02)
              : alpha(theme.palette.common.black, 0.015),
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 500, mr: 0.5, whiteSpace: 'nowrap' }}
        >
          Referencias:
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {LEGEND.map(({ label, color, shape }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {shape === 'circle' ? (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: color,
                    flexShrink: 0,
                  }}
                />
              ) : (
                /* Línea animada para "ruta activa" */
                <Box
                  sx={{
                    width: 20,
                    height: 2,
                    bgcolor: color,
                    borderRadius: 1,
                    flexShrink: 0,
                    background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 10px)`,
                  }}
                />
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ ml: 'auto', flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Scroll para navegar · Minimap abajo a la derecha
          </Typography>
        </Box>
      </Box>

      {/* Contenedor del flow */}
      <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
        {open && <OrganigramaFlow />}
      </Box>
    </Dialog>
  );
}
