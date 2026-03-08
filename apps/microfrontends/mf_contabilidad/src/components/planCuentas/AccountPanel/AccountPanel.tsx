import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FilePlus, Pencil, X } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useFormState } from 'react-hook-form';

import type { AccountPanelProps } from './AccountPanel.types';
import { requiresContraCuenta } from './AccountPanel.types';
import { AccountFormFields } from './AccountFormFields';

const PANEL_WIDTH = 440;
const TABLET_PANEL_WIDTH = 420;

/**
 * Panel lateral unificado para crear y editar cuentas.
 * - Alterna entre modo crear/editar con transición suave
 * - Muestra campo contracuenta condicionalmente
 * - Optimizado con React.memo para evitar re-renders innecesarios
 */
export const AccountPanel = memo(function AccountPanel({
  open,
  mode,
  selectedItem,
  methods,
  onClose,
  onSubmit,
  isLoading = false,
  codigoStatus = 'idle',
  codigoExistente = null,
}: AccountPanelProps) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down(1200));
  const isMobile = useMediaQuery(theme.breakpoints.down(640));

  // Suscribirse a formState para que el componente se actualice cuando cambie isValid
  const { isValid } = useFormState({ control: methods.control });

  const codigoPadre = methods.watch('valorPadre') || '';
  const codigoField = methods.watch('codigo') || '';

  // El botón está deshabilitado si el código ya existe
  const codigoYaExiste = codigoStatus === 'exists';

  // Determinar si mostrar campo contracuenta
  const showContraCuenta = useMemo(
    () => requiresContraCuenta(codigoPadre),
    [codigoPadre],
  );

  // Handler del submit optimizado
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      methods.handleSubmit(onSubmit)();
    },
    [methods, onSubmit],
  );

  // Scroll fade: detect if scrolled to bottom
  const formBodyRef = useRef<HTMLDivElement>(null);
  const [showScrollFade, setShowScrollFade] = useState(false);

  useEffect(() => {
    const el = formBodyRef.current;
    if (!el) return;

    const checkScroll = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 4;
      setShowScrollFade(hasOverflow && !atBottom);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [open, mode]);

  // Configuración visual según el modo
  const modeConfig = useMemo(
    () => ({
      crear: {
        title: 'Crear Subcuenta',
        subtitle: selectedItem
          ? `En: ${selectedItem.label.split(' – ')[1]}`
          : '',
        icon: FilePlus,
        color: 'success' as const,
        buttonText: 'Crear Cuenta',
      },
      editar: {
        title: 'Editar Cuenta',
        subtitle: selectedItem
          ? `${selectedItem.label.split(' – ')[0]}`
          : '',
        icon: Pencil,
        color: 'primary' as const,
        buttonText: 'Guardar Cambios',
      },
    }),
    [selectedItem],
  );

  const config = mode ? modeConfig[mode] : modeConfig.crear;
  const IconComponent = config.icon;

  const isCreateMode = mode === 'crear';

  // Code preview value
  const codePreviewValue = codigoField
    ? `${codigoPadre}-${codigoField}`
    : `${codigoPadre}-__`;

  // Panel content
  const panelContent = (
    <Paper
      elevation={isMobile ? 0 : 2}
      sx={{
        width: isMobile ? '100%' : isTablet ? TABLET_PANEL_WIDTH : PANEL_WIDTH,
        height: isMobile ? '85vh' : '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMobile ? '20px 20px 0 0' : 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        ...(isMobile && {
          boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        }),
        ...(isTablet && !isMobile && {
          boxShadow: theme.shadows[8],
        }),
      }}
    >
      {/* Mobile drag handle */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 1,
            pb: 0.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
            }}
          />
        </Box>
      )}

      {/* Header del panel */}
      <Box
        className="form-header"
        sx={{
          p: '12px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          className={`form-header-icon ${isCreateMode ? 'create' : 'edit'}`}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            ...(isCreateMode
              ? {
                  bgcolor: 'rgba(13,107,94,0.1)',
                  color: '#0d6b5e',
                }
              : {
                  bgcolor: 'rgba(37,99,235,0.1)',
                  color: '#2563eb',
                }),
          }}
        >
          <IconComponent size={20} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            className="form-header-title"
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {config.title}
          </Typography>
          {config.subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.25,
                fontSize: '0.75rem',
                maxWidth: 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {config.subtitle}
              {isCreateMode && codigoPadre && (
                <>
                  {' '}
                  <Box
                    component="span"
                    className="form-header-parent-code"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#0d6b5e',
                      bgcolor: 'rgba(13,107,94,0.08)',
                      px: '6px',
                      py: '1px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                    }}
                  >
                    {codigoPadre}
                  </Box>
                </>
              )}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 30,
            height: 30,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(220,38,38,0.08)',
              color: 'error.main',
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Formulario — scroll independiente del árbol */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Form body with scroll */}
        <Box
          ref={formBodyRef}
          className="form-body"
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            p: '16px 20px',
            position: 'relative',
            '&::after': showScrollFade
              ? {
                  content: '""',
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'block',
                  height: 32,
                  background: (t: typeof theme) =>
                    `linear-gradient(to bottom, transparent, ${t.palette.background.paper})`,
                  pointerEvents: 'none',
                }
              : { display: 'none' },
          }}
        >
          {/* Code preview bar — only in create mode */}
          {isCreateMode && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: '8px 12px',
                borderRadius: '8px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(13,107,94,0.06)'
                    : '#f0fdf9',
                border: '1px solid rgba(13,107,94,0.12)',
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                Codigo completo:
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#0d6b5e',
                  letterSpacing: '0.03em',
                }}
              >
                {codePreviewValue}
              </Typography>
            </Box>
          )}

          <FormProvider {...methods}>
            <AccountFormFields
              mode={mode}
              showContraCuenta={showContraCuenta}
              codigoPadre={codigoPadre}
              codigoStatus={codigoStatus}
              codigoExistente={codigoExistente}
            />
          </FormProvider>
        </Box>

        {/* Footer — fixed at bottom */}
        <Box
          className="form-footer"
          sx={{
            p: '16px 20px',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Button
              type="submit"
              variant="contained"
              color={config.color}
              disabled={!isValid || isLoading || codigoYaExiste}
              sx={{
                flex: 1,
                justifyContent: 'center',
                minHeight: 40,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: (t: typeof theme) =>
                    `0 4px 12px ${alpha(t.palette[config.color].main, 0.3)}`,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                config.buttonText
              )}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{
                minHeight: 40,
                minWidth: 100,
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
          </Stack>
        </Box>
      </Box>
    </Paper>
  );

  // Mobile: fixed bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <Box
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 99,
              transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            opacity: open ? 1 : 0,
            transition:
              'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          {panelContent}
        </Box>
      </>
    );
  }

  // Tablet: fixed right panel
  if (isTablet) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <Box
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 99,
              transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            width: TABLET_PANEL_WIDTH,
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            opacity: open ? 1 : 0,
            transition:
              'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          {panelContent}
        </Box>
      </>
    );
  }

  // Desktop: inline slide panel
  return (
    <Box
      sx={{
        width: open ? PANEL_WIDTH : 0,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        opacity: open ? 1 : 0,
        transition:
          'width 300ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: open ? 'auto' : 'none',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {panelContent}
    </Box>
  );
});
