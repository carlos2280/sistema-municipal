import { LayoutGrid as TableChartIcon } from 'lucide-react';
import {
  Box,
  Collapse,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Controller, useFormContext } from 'react-hook-form';
import type { SchemaPresupuestoHeader } from '../../../types/zod/presupuesto.zod';

interface PresupuestoHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  numero: number | null;
  anosDisponibles: number[];
  readonly?: boolean;
}

const PresupuestoHeader = ({
  collapsed,
  numero,
  anosDisponibles,
  readonly = false,
}: PresupuestoHeaderProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SchemaPresupuestoHeader>();

  const glosa = watch('glosa');

  return (
    <Collapse in={!collapsed} timeout="auto" sx={{ flexShrink: 0 }}>
      <Box
        sx={(t) => ({
          bgcolor: t.meridian.surfaces.s1,
          borderBottom: `1px solid ${t.meridian.borders.muted}`,
        })}
      >
        <Box
          sx={{
            mx: 2.5,
            my: 1.5,
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          {/* Top: icono + título + número */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}
          >
            <Box
              sx={(t) => ({
                width: 36,
                height: 36,
                borderRadius: '9px',
                bgcolor: alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              })}
            >
              <TableChartIcon sx={{ fontSize: '18px' }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '-0.01em',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {glosa || 'Presupuesto Inicial'}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'text.disabled',
                  mt: 0.25,
                }}
              >
                N. {numero !== null ? String(numero).padStart(3, '0') : '---'}
              </Typography>
            </Box>
          </Box>

          {/* Formulario — grid 3 cols: Año / Número / N. Acta, luego Glosa full */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 2fr' },
              gap: 1.5,
            }}
          >
            {/* Año Contable */}
            <Box>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.625,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                Año Contable{' '}
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography>
              <Controller
                name="anoContable"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="small"
                    fullWidth
                    disabled={readonly}
                    error={!!errors.anoContable}
                    sx={{
                      fontSize: '12.5px',
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 600,
                      height: 32,
                    }}
                  >
                    {anosDisponibles.map((ano) => (
                      <MenuItem key={ano} value={ano}>
                        {ano}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Box>

            {/* Número (readonly) */}
            <Box>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.625,
                }}
              >
                Número
              </Typography>
              <TextField
                value={
                  numero !== null ? String(numero).padStart(3, '0') : '(nuevo)'
                }
                size="small"
                fullWidth
                disabled
                slotProps={{
                  htmlInput: {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 600,
                      fontSize: '12.5px',
                      letterSpacing: '0.04em',
                    },
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { height: 32 } }}
              />
            </Box>

            {/* N° Acta/Decreto */}
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.625,
                }}
              >
                N. Acta / Decreto
              </Typography>
              <Controller
                name="actaDecreto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    placeholder="Referencia del acto administrativo"
                    disabled={readonly}
                    error={!!errors.actaDecreto}
                    helperText={errors.actaDecreto?.message}
                    slotProps={{
                      htmlInput: {
                        maxLength: 100,
                        style: { fontSize: '12.5px' },
                      },
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { height: 32 } }}
                  />
                )}
              />
            </Box>

            {/* Glosa — fila propia, ancho completo */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.625,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                Glosa{' '}
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography>
              <Controller
                name="glosa"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    placeholder="Descripción del documento"
                    disabled={readonly}
                    error={!!errors.glosa}
                    helperText={errors.glosa?.message}
                    slotProps={{
                      htmlInput: {
                        maxLength: 255,
                        style: { fontSize: '12.5px' },
                      },
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { height: 32 } }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
};

export default PresupuestoHeader;
