import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

export interface DeleteConfirmDialogProps {
  open: boolean;
  accountCode: string;
  accountName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Dialog de confirmación para eliminar una cuenta del plan de cuentas.
 * Diseño personalizado que sigue el prototipo CIVITAS v3.
 */
export const DeleteConfirmDialog = memo(function DeleteConfirmDialog({
  open,
  accountCode,
  accountName,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  // Animate in/out
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Small delay to trigger CSS transition
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading],
  );

  if (!open) return null;

  return (
    <Box
      className="dialog-overlay"
      onClick={handleOverlayClick}
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 200ms ease',
      }}
    >
      <Box
        className="dialog"
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '16px',
          boxShadow: 24,
          maxWidth: 420,
          width: '90%',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
      >
        {/* Header */}
        <Box
          className="dialog-header"
          sx={{
            p: 3,
            display: 'flex',
            gap: 2,
          }}
        >
          <Box
            className="dialog-icon warning"
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              color: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </Box>
          <Box>
            <Typography
              className="dialog-title"
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '1.0625rem',
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              Eliminar cuenta
            </Typography>
            <Typography
              className="dialog-text"
              sx={{
                fontSize: '0.8125rem',
                color: 'text.secondary',
                mt: 0.5,
              }}
            >
              Esta accion no se puede deshacer. La cuenta sera eliminada
              permanentemente del plan de cuentas.
            </Typography>
          </Box>
        </Box>

        {/* Detail */}
        <Box
          className="dialog-detail"
          sx={{
            mx: 3,
            p: '12px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.04)
                : theme.palette.grey[100],
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {accountCode} — {accountName}
        </Box>

        {/* Footer */}
        <Box
          className="dialog-footer"
          sx={{
            p: '16px 24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: 1,
            borderColor: 'divider',
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              minHeight: 40,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Trash2 size={16} />
              )
            }
            sx={{
              minHeight: 40,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: (theme) =>
                  `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
              },
            }}
          >
            Eliminar
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
