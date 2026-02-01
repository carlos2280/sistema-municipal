import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FilePlus, Pencil, X } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { FormProvider, useFormState } from 'react-hook-form';

import type { AccountPanelProps } from './AccountPanel.types';
import { requiresContraCuenta } from './AccountPanel.types';
import { AccountFormFields } from './AccountFormFields';

const PANEL_WIDTH = 420;

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
  // Suscribirse a formState para que el componente se actualice cuando cambie isValid
  const { isValid } = useFormState({ control: methods.control });

  const codigoPadre = methods.watch('valorPadre') || '';

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

  return (
    <Collapse
      in={open}
      orientation="horizontal"
      timeout={300}
      sx={{
        flex: open ? `0 0 ${PANEL_WIDTH}px` : '0 0 0px',
        transition: 'flex 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: PANEL_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header del panel */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            bgcolor: (theme) => alpha(theme.palette[config.color].main, 0.04),
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette[config.color].main, 0.1),
                color: `${config.color}.main`,
                display: 'flex',
              }}
            >
              <IconComponent size={20} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
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
                    maxWidth: 280,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {config.subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              mt: -0.5,
              mr: -0.5,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                color: 'error.main',
              },
            }}
          >
            <X size={18} />
          </IconButton>
        </Box>

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2.5,
            }}
          >
            <FormProvider {...methods}>
              <AccountFormFields
                mode={mode}
                showContraCuenta={showContraCuenta}
                codigoStatus={codigoStatus}
                codigoExistente={codigoExistente}
              />
            </FormProvider>
          </Box>

          <Divider />

          {/* Acciones */}
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                color={config.color}
                fullWidth
                disabled={!isValid || isLoading || codigoYaExiste}
                sx={{
                  py: 1.25,
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: (theme) =>
                      `0 4px 12px ${alpha(theme.palette[config.color].main, 0.3)}`,
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
                  py: 1.25,
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
    </Collapse>
  );
});
