import {
  Autocomplete,
  Box,
  CircularProgress,
  Collapse,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AlertCircle, ArrowRightLeft, CheckCircle, Hash, Type } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useLazyBuscarCuentasPorPrefijoQuery } from 'mf_store/store';

import type {
  AccountFormData,
  CodigoStatus,
  CuentaExistente,
  PanelMode,
} from './AccountPanel.types';
import { getContraCuentaPrefijo } from './AccountPanel.types';
import { formatCodigo } from '../../../utils/planDeCuentasUtils';

interface ContraCuentaOption {
  id: number;
  codigo: string;
  nombre: string;
}

interface AccountFormFieldsProps {
  mode: PanelMode;
  showContraCuenta: boolean;
  codigoPadre?: string;
  codigoStatus?: CodigoStatus;
  codigoExistente?: CuentaExistente | null;
}

/**
 * Campos del formulario de cuenta.
 * Incluye máscara dinámica de código según nivel jerárquico.
 */
export const AccountFormFields = memo(function AccountFormFields({
  mode,
  showContraCuenta,
  codigoPadre = '',
  codigoStatus = 'idle',
  codigoExistente = null,
}: AccountFormFieldsProps) {
  const { control } = useFormContext<AccountFormData>();

  const valorPadre = useWatch({ control, name: 'valorPadre' });
  const tipoCuentaId = useWatch({ control, name: 'tipoCuentaId' });

  // ── ContraCuenta Autocomplete state ──
  const [buscarCuentas, { isFetching: buscandoCuentas }] = useLazyBuscarCuentasPorPrefijoQuery();
  const [contraCuentaOptions, setContraCuentaOptions] = useState<ContraCuentaOption[]>([]);
  const contraCuentaPrefijo = useMemo(() => getContraCuentaPrefijo(codigoPadre), [codigoPadre]);

  // Cargar opciones cuando se muestra el campo de contraCuenta
  useEffect(() => {
    if (showContraCuenta && contraCuentaPrefijo) {
      buscarCuentas(contraCuentaPrefijo)
        .unwrap()
        .then((data) => setContraCuentaOptions(data))
        .catch(() => setContraCuentaOptions([]));
    } else {
      setContraCuentaOptions([]);
    }
  }, [showContraCuenta, contraCuentaPrefijo, buscarCuentas]);

  // Calcular dígitos permitidos según nivel
  const digitCount = getDigitCountByLevel(tipoCuentaId ?? 0);
  const codigoFormateado = valorPadre
    ? formatCodigo(valorPadre, tipoCuentaId ?? 0)
    : '';

  const isEditMode = mode === 'editar';

  // Determinar el estado visual del campo código
  const getCodigoFieldState = () => {
    if (isEditMode) return { color: 'text.secondary', icon: null, message: '' };

    switch (codigoStatus) {
      case 'checking':
        return {
          color: 'info.main',
          icon: <CircularProgress size={16} />,
          message: 'Verificando disponibilidad...',
        };
      case 'available':
        return {
          color: 'success.main',
          icon: <CheckCircle size={16} />,
          message: 'Código disponible',
        };
      case 'exists':
        return {
          color: 'error.main',
          icon: <AlertCircle size={16} />,
          message: codigoExistente
            ? `Ya existe: ${codigoExistente.nombre}`
            : 'Este código ya existe',
        };
      default:
        return { color: 'text.secondary', icon: null, message: '' };
    }
  };

  const codigoFieldState = getCodigoFieldState();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Campo Código */}
      <Box>
        <FieldLabel icon={<Hash size={14} />} label="Código de Cuenta" required />
        <Controller
          name="codigo"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const hasError = !!error || codigoStatus === 'exists';
            const isSuccess = codigoStatus === 'available';

            return (
              <TextField
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  const onlyNums = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, digitCount);
                  field.onChange(onlyNums);
                }}
                placeholder={`${digitCount} dígitos`}
                size="small"
                fullWidth
                disabled={isEditMode}
                error={hasError}
                color={isSuccess ? 'success' : undefined}
                helperText={
                  error?.message ||
                  codigoFieldState.message ||
                  `Ingrese ${digitCount} dígitos numéricos`
                }
                slotProps={{
                  input: {
                    inputProps: {
                      inputMode: 'numeric',
                      pattern: '\\d*',
                      maxLength: digitCount,
                    },
                    startAdornment: codigoFormateado && (
                      <InputAdornment position="start">
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'primary.main',
                            fontSize: '0.875rem',
                          }}
                        >
                          {codigoFormateado}-
                        </Typography>
                      </InputAdornment>
                    ),
                    endAdornment: codigoFieldState.icon && (
                      <InputAdornment position="end">
                        <Box sx={{ color: codigoFieldState.color, display: 'flex' }}>
                          {codigoFieldState.icon}
                        </Box>
                      </InputAdornment>
                    ),
                  },
                  formHelperText: {
                    sx: {
                      color: codigoFieldState.color,
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    ...(isSuccess && {
                      '& fieldset': {
                        borderColor: (theme) => theme.palette.success.main,
                      },
                    }),
                  },
                }}
              />
            );
          }}
        />
      </Box>

      {/* Campo Nombre */}
      <Box>
        <FieldLabel icon={<Type size={14} />} label="Nombre de la Cuenta" required />
        <Controller
          name="nombre"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              value={field.value || ''}
              placeholder="Ej: Caja Chica Municipal"
              size="small"
              fullWidth
              error={!!error}
              helperText={error?.message}
              autoFocus={mode === 'crear'}
            />
          )}
        />
      </Box>

      {/* Campo Contracuenta (condicional con Autocomplete) */}
      <Collapse in={showContraCuenta} timeout={200}>
        <Box>
          <FieldLabel
            icon={<ArrowRightLeft size={14} />}
            label="Contracuenta Asociada"
            hint={`Cuenta del Titulo ${contraCuentaPrefijo === '4' ? '4 (Ingresos)' : '5 (Gastos)'}`}
          />
          <Controller
            name="contraCuenta"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                options={contraCuentaOptions}
                getOptionLabel={(opt) =>
                  typeof opt === 'string' ? opt : `${formatCodigo(opt.codigo, 4)} - ${opt.nombre}`
                }
                value={
                  contraCuentaOptions.find((o) => o.codigo === field.value) ?? null
                }
                onChange={(_e, newValue) => {
                  field.onChange(newValue ? newValue.codigo : '');
                }}
                loading={buscandoCuentas}
                noOptionsText="Sin cuentas disponibles"
                loadingText="Buscando..."
                size="small"
                fullWidth
                isOptionEqualToValue={(opt, val) => opt.codigo === val.codigo}
                renderOption={(props, opt) => (
                  <li {...props} key={opt.id}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', width: '100%' }}>
                      <Typography
                        component="span"
                        sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: 'primary.main', flexShrink: 0 }}
                      >
                        {formatCodigo(opt.codigo, 4)}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {opt.nombre}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Seleccione la contracuenta"
                    error={!!error}
                    helperText={error?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.02),
                      },
                    }}
                  />
                )}
              />
            )}
          />
        </Box>
      </Collapse>

      {/* Info del nivel actual */}
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
          border: 1,
          borderColor: (theme) => alpha(theme.palette.info.main, 0.1),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <strong>Nivel jerárquico:</strong> {getLevelName(tipoCuentaId ?? 0)}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          <strong>Formato de código:</strong> {getCodeFormat(tipoCuentaId ?? 0)}
        </Typography>
      </Box>
    </Box>
  );
});

// ============================================================================
// Componentes auxiliares
// ============================================================================

interface FieldLabelProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
}

const FieldLabel = memo(function FieldLabel({
  icon,
  label,
  required,
  hint,
}: FieldLabelProps) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
        <Typography
          component="label"
          variant="body2"
          sx={{ fontWeight: 500, color: 'text.primary' }}
        >
          {label}
          {required && (
            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
      </Box>
      {hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.25, ml: 2.5 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Retorna la cantidad de dígitos permitidos según el tipoCuentaId (nivel)
 */
function getDigitCountByLevel(tipoCuentaId: number): number {
  // Niveles 3 y 4 usan 2 dígitos
  if (tipoCuentaId === 3 || tipoCuentaId === 4) return 2;
  // Niveles 5, 6, 7, 8 usan 3 dígitos
  if ([5, 6, 7, 8].includes(tipoCuentaId)) return 3;
  return 2; // Default
}

/**
 * Nombre legible del nivel jerárquico
 */
function getLevelName(tipoCuentaId: number): string {
  const names: Record<number, string> = {
    1: 'Título',
    2: 'Grupo',
    3: 'Nivel 1 (Subgrupo)',
    4: 'Nivel 2',
    5: 'Nivel 3',
    6: 'Nivel 4',
    7: 'Nivel 5',
    8: 'Nivel 6',
  };
  return names[tipoCuentaId] || 'Desconocido';
}

/**
 * Formato del código según nivel
 */
function getCodeFormat(tipoCuentaId: number): string {
  const formats: Record<number, string> = {
    3: 'XXX-00',
    4: 'XXX-00-00',
    5: 'XXX-00-00-000',
    6: 'XXX-00-00-000-000',
    7: 'XXX-00-00-000-000-000',
    8: 'XXX-00-00-000-000-000-000',
  };
  return formats[tipoCuentaId] || 'XXX';
}
