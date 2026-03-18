import { formatCodigo } from '@/utils/planDeCuentasUtils';
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
import type { Control } from 'react-hook-form';
import { FormProvider, useFormState, useWatch } from 'react-hook-form';

import { AccountFormFields } from './AccountFormFields';
import type {
  AccountFormData,
  AccountPanelProps,
  CodigoStatus,
} from './AccountPanel.types';
import { requiresContraCuenta } from './AccountPanel.types';

/* ── MERIDIAN Typography ── */
const FONT_DISPLAY = '"Bricolage Grotesque", sans-serif';
const FONT_MONO = '"DM Mono", monospace';

/* ── Panel widths ── */
const PANEL_WIDTH = 440;
const TABLET_PANEL_WIDTH = 420;

/* ── Level config (nombres SINIM) ── */
const NIVEL_NOMBRES: Record<number, string> = {
  1: 'Título',
  2: 'Grupo',
  3: 'Subgrupo',
  4: 'Cuenta',
  5: 'Subcuenta',
  6: 'Sub-subcuenta',
  7: 'Auxiliar',
  8: 'Subauxiliar',
};

function getChildDigits(parentTipoCuentaId: number): number {
  if (parentTipoCuentaId === 3 || parentTipoCuentaId === 4) return 2;
  if ([5, 6, 7].includes(parentTipoCuentaId)) return 3;
  return 2;
}

/**
 * Panel lateral para crear y editar cuentas.
 * Diseño alineado con prototipo MERIDIAN.
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

  const { isValid } = useFormState({ control: methods.control });
  const codigoPadre =
    useWatch({ control: methods.control, name: 'valorPadre' }) || '';
  const tipoCuentaId =
    useWatch({ control: methods.control, name: 'tipoCuentaId' }) || 0;

  const codigoYaExiste = codigoStatus === 'exists';
  const showContraCuenta = useMemo(
    () => requiresContraCuenta(codigoPadre),
    [codigoPadre],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      methods.handleSubmit(onSubmit)();
    },
    [methods, onSubmit],
  );

  // Scroll fade
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

  const isCreateMode = mode === 'crear';

  // Level info for header
  const childTipoCuentaId = tipoCuentaId + 1;
  const childNivelNombre = NIVEL_NOMBRES[childTipoCuentaId] ?? '';
  const childDigits = getChildDigits(tipoCuentaId);

  const codigoPadreFormateado = codigoPadre
    ? formatCodigo(codigoPadre, tipoCuentaId)
    : '';

  // ── Panel content ──
  const panelContent = (
    <Paper
      elevation={isMobile ? 0 : 0}
      sx={{
        width: isMobile ? '100%' : isTablet ? TABLET_PANEL_WIDTH : PANEL_WIDTH,
        height: isMobile ? '85vh' : '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMobile ? '20px 20px 0 0' : 0,
        overflow: 'hidden',
        bgcolor: theme.meridian.surfaces.s2,
        borderLeft: isMobile
          ? 'none'
          : `1px solid ${theme.meridian.borders.strong}`,
        boxShadow: isMobile
          ? theme.meridian.shadows.lg
          : theme.meridian.shadows.lg,
      }}
    >
      {/* Mobile drag handle */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 0.5 }}>
          <Box
            sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }}
          />
        </Box>
      )}

      {/* ── Header ── */}
      <Box
        sx={{
          p: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: isCreateMode
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.info.main, 0.1),
            color: isCreateMode
              ? theme.palette.primary.main
              : theme.palette.info.main,
            transition: 'background 200ms, color 200ms',
          }}
        >
          {isCreateMode ? <FilePlus size={18} /> : <Pencil size={18} />}
        </Box>

        {/* Title + subtitle */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontSize: '14.5px',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
            }}
          >
            {isCreateMode ? 'Crear Subcuenta' : 'Editar Cuenta'}
          </Typography>
          <Typography
            sx={{
              fontSize: '11.5px',
              color: 'text.secondary',
              mt: '3px',
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isCreateMode
              ? selectedItem
                ? `En: ${selectedItem.label.split(' – ')[1]} (${codigoPadreFormateado})`
                : ''
              : selectedItem
                ? `${NIVEL_NOMBRES[tipoCuentaId] ?? ''} — ${codigoPadreFormateado}`
                : ''}
          </Typography>
        </Box>

        {/* Close button */}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 28,
            height: 28,
            ml: 'auto',
            flexShrink: 0,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
            },
          }}
        >
          <X size={14} />
        </IconButton>
      </Box>

      {/* ── Form ── */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        {/* Form body with scroll */}
        <Box
          ref={formBodyRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            p: '20px',
            position: 'relative',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              background: theme.meridian.borders.strong,
              borderRadius: 2,
            },
            '&::after': showScrollFade
              ? {
                  content: '""',
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'block',
                  height: 32,
                  background: `linear-gradient(to bottom, transparent, ${theme.meridian.surfaces.s2})`,
                  pointerEvents: 'none',
                }
              : { display: 'none' },
          }}
        >
          {/* Level info bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              p: '9px 13px',
              bgcolor: theme.meridian.surfaces.s3,
              border: `1px solid ${theme.meridian.borders.muted}`,
              borderRadius: '8px',
              mb: 2,
              fontSize: '12px',
              color: 'text.secondary',
              lineHeight: 1.5,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                flexShrink: 0,
              }}
            />
            {isCreateMode ? (
              <span>
                Nivel{' '}
                <strong style={{ color: theme.palette.text.primary }}>
                  {childTipoCuentaId} · {childNivelNombre}
                </strong>
                {' — agrega '}
                <strong style={{ color: theme.palette.text.primary }}>
                  {childDigits} dígito{childDigits > 1 ? 's' : ''}
                </strong>
              </span>
            ) : (
              <span>
                Nivel{' '}
                <strong style={{ color: theme.palette.text.primary }}>
                  {tipoCuentaId} · {NIVEL_NOMBRES[tipoCuentaId] ?? ''}
                </strong>
                {' — código '}
                <strong style={{ color: theme.palette.text.primary }}>
                  {codigoPadreFormateado}
                </strong>
              </span>
            )}
          </Box>

          {/* Code preview */}
          <CodePreview
            control={methods.control}
            tipoCuentaId={tipoCuentaId}
            isCreateMode={isCreateMode}
            codigoStatus={codigoStatus}
          />

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

        {/* ── Footer ── */}
        <Box
          sx={{
            p: '16px 20px',
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.meridian.surfaces.s2,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              color={isCreateMode ? 'success' : 'primary'}
              disabled={!isValid || isLoading || codigoYaExiste}
              sx={{
                flex: 1,
                minHeight: 38,
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '-0.01em',
                boxShadow: 'none',
                '&:hover': { opacity: 0.88 },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : isCreateMode ? (
                'Crear Cuenta →'
              ) : (
                'Guardar Cambios'
              )}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{
                minHeight: 38,
                color: 'text.secondary',
                borderColor: theme.meridian.borders.strong,
                '&:hover': {
                  borderColor: 'text.secondary',
                  bgcolor: theme.meridian.surfaces.s3,
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

  // ── Mobile: bottom sheet ──
  if (isMobile) {
    return (
      <>
        {open && (
          <Box
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: alpha(theme.palette.common.black, 0.4),
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
              'transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 300ms cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          {panelContent}
        </Box>
      </>
    );
  }

  // ── Desktop & Tablet: fixed right panel (slide from right, like prototype) ──
  return (
    <>
      {/* Backdrop for tablet */}
      {isTablet && open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: alpha(theme.palette.common.black, 0.4),
            zIndex: 99,
            transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: 28, // debajo del Eyebrow
          bottom: 0,
          zIndex: isTablet ? 100 : 91,
          width: isTablet ? TABLET_PANEL_WIDTH : PANEL_WIDTH,
          maxWidth: 'calc(100vw - 40px)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: open ? 'auto' : 'none',
          [theme.breakpoints.down('md')]: {
            top: 44, // mobile Eyebrow height
          },
        }}
      >
        {panelContent}
      </Box>
    </>
  );
});

// ============================================================================
// CodePreview — MERIDIAN design with validation states
// ============================================================================
interface CodePreviewProps {
  control: Control<AccountFormData>;
  tipoCuentaId: number;
  isCreateMode: boolean;
  codigoStatus: CodigoStatus;
}

function CodePreview({
  control,
  tipoCuentaId,
  isCreateMode,
  codigoStatus,
}: CodePreviewProps) {
  const theme = useTheme();
  const valorPadre = useWatch({ control, name: 'valorPadre' }) || '';
  const codigo = useWatch({ control, name: 'codigo' }) || '';

  const fullCode = codigo ? `${valorPadre}${codigo}` : '';
  const formatted = fullCode
    ? formatCodigo(fullCode, isCreateMode ? tipoCuentaId + 1 : tipoCuentaId)
    : isCreateMode
      ? `${formatCodigo(valorPadre, tipoCuentaId)}-…`
      : formatCodigo(valorPadre, tipoCuentaId);

  // Digits remaining
  const expectedDigits = getChildDigits(tipoCuentaId);
  const remaining = expectedDigits - (codigo?.length ?? 0);

  // Hint text based on state
  let hintText = '';
  let hintColor = theme.palette.text.secondary;

  if (!isCreateMode) {
    hintText = '✓ código actual';
    hintColor = theme.palette.success.main;
  } else if (remaining > 0) {
    hintText = `${remaining} dígito(s) faltantes`;
  } else {
    switch (codigoStatus) {
      case 'checking':
        hintText = 'verificando…';
        break;
      case 'available':
        hintText = '✓ disponible';
        hintColor = theme.palette.success.main;
        break;
      case 'exists':
        hintText = '✗ ya existe';
        hintColor = theme.palette.error.main;
        break;
      default:
        hintText = '';
    }
  }

  // Border color based on state
  const borderColor =
    codigoStatus === 'available'
      ? alpha(theme.palette.success.main, 0.45)
      : codigoStatus === 'exists'
        ? alpha(theme.palette.error.main, 0.45)
        : alpha(theme.palette.primary.main, 0.14);

  const bgColor =
    codigoStatus === 'available'
      ? alpha(theme.palette.success.main, 0.05)
      : codigoStatus === 'exists'
        ? alpha(theme.palette.error.main, 0.05)
        : alpha(theme.palette.primary.main, 0.05);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        p: '10px 12px',
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        mb: '18px',
        overflow: 'hidden',
        transition: 'border-color 200ms, background 200ms',
      }}
    >
      <Typography
        sx={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        Código completo
      </Typography>
      <Box
        sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}
      >
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: '14px',
            fontWeight: 700,
            color: theme.palette.primary.main,
            letterSpacing: '0.03em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {formatted}
        </Typography>
        <Typography
          sx={{
            fontSize: '10.5px',
            color: hintColor,
            fontFamily: FONT_MONO,
            fontWeight:
              codigoStatus === 'available' || codigoStatus === 'exists'
                ? 600
                : 400,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {codigoStatus === 'checking' && (
            <CircularProgress size={9} sx={{ color: 'text.secondary' }} />
          )}
          {hintText}
        </Typography>
      </Box>
    </Box>
  );
}
