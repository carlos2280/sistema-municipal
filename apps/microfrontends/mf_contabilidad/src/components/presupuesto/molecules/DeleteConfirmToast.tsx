import { Trash2 as DeleteOutlineIcon } from 'lucide-react';
import { Box, Button, Slide, Snackbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import { type ReactElement, type Ref, forwardRef } from 'react';

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface DeleteConfirmToastProps {
  /** Controla visibilidad del toast */
  open: boolean;
  /** Código de la cuenta a eliminar (ej: "11503") */
  cuentaCodigo?: string;
  /** Nombre de la cuenta a eliminar */
  cuentaNombre?: string;
  /** Cantidad de subcuentas que serán eliminadas en cascada */
  subcuentasCount: number;
  /** Callback al confirmar eliminación */
  onConfirm: () => void;
  /** Callback al cancelar */
  onCancel: () => void;
  /** Estado de carga (deshabilita botones) */
  loading?: boolean;
}

// ─── Transición ─────────────────────────────────────────────────────────────

const SlideUp = forwardRef(
  (props: TransitionProps & { children: ReactElement }, ref: Ref<unknown>) => (
    <Slide direction="up" ref={ref} {...props} />
  ),
);
SlideUp.displayName = 'SlideUp';

// ─── Componente ─────────────────────────────────────────────────────────────

/**
 * Molecule: toast de confirmación para eliminar líneas del presupuesto.
 * Aparece desde el fondo de la pantalla (como en el prototipo MERIDIAN).
 *
 * Muestra: icono trash + texto descriptivo + botones Cancelar / Eliminar.
 * Si hay subcuentas, indica cuántas serán eliminadas en cascada.
 */
const DeleteConfirmToast = ({
  open,
  cuentaCodigo,
  cuentaNombre,
  subcuentasCount,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmToastProps) => {
  // Texto descriptivo
  const nombreCorto =
    cuentaNombre && cuentaNombre.length > 40
      ? `${cuentaNombre.slice(0, 37)}…`
      : cuentaNombre;

  const textoSubcuentas =
    subcuentasCount > 0
      ? ` y sus ${subcuentasCount} subcuenta${subcuentasCount > 1 ? 's' : ''}`
      : '';

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideUp}
      // No auto-hide: requiere acción del usuario
    >
      <Box
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderRadius: '10px',
          bgcolor: t.meridian.surfaces.s2,
          border: `1px solid ${alpha(t.palette.error.main, 0.25)}`,
          boxShadow: `0 8px 32px ${alpha(t.meridian.surfaces.ground, 0.5)}`,
          maxWidth: 520,
          minWidth: 340,
        })}
      >
        {/* Icono */}
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: alpha(t.palette.error.main, 0.1),
            color: 'error.main',
            flexShrink: 0,
          })}
        >
          <DeleteOutlineIcon sx={{ fontSize: '16px' }} />
        </Box>

        {/* Texto */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'text.primary',
              lineHeight: 1.4,
            }}
          >
            Eliminar{' '}
            <Typography
              component="span"
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {cuentaCodigo}
            </Typography>
            {nombreCorto && (
              <>
                {' — '}
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, fontSize: '12px' }}
                >
                  {nombreCorto}
                </Typography>
              </>
            )}
            {textoSubcuentas && (
              <Typography
                component="span"
                sx={{
                  color: 'warning.main',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                {textoSubcuentas}
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Acciones */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            onClick={onCancel}
            disabled={loading}
            sx={(t) => ({
              height: 28,
              fontSize: '11px',
              fontWeight: 600,
              color: 'text.secondary',
              bgcolor: t.meridian.surfaces.s3,
              border: `1px solid ${t.meridian.borders.muted}`,
              '&:hover': {
                bgcolor: t.meridian.surfaces.s4 ?? t.meridian.surfaces.s3,
              },
              minWidth: 0,
              px: 1.5,
            })}
          >
            Cancelar
          </Button>
          <Button
            size="small"
            onClick={onConfirm}
            disabled={loading}
            sx={(t) => ({
              height: 28,
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              bgcolor: t.palette.error.main,
              '&:hover': { bgcolor: t.palette.error.dark },
              minWidth: 0,
              px: 1.5,
            })}
          >
            Eliminar
          </Button>
        </Box>
      </Box>
    </Snackbar>
  );
};

export default DeleteConfirmToast;
