import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import {
  useGetCategoriasQuery,
  useGetPrioridadesQuery,
} from 'mf_store/store';
import { useTicketForm } from '@/hooks/useTicketForm';
import type { TicketFormValues } from '@/hooks/useTicketForm';

interface TicketFormProps {
  defaultValues?: Partial<TicketFormValues>;
  ticketId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function TicketForm({ defaultValues, ticketId, onSuccess, onCancel }: TicketFormProps) {
  const theme = useTheme();
  const { data: categorias } = useGetCategoriasQuery();
  const { data: prioridades } = useGetPrioridadesQuery();

  const { form, onSubmit, isSubmitting, isEditing } = useTicketForm({
    defaultValues,
    ticketId,
    onSuccess,
  });

  const { control, formState: { errors } } = form;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: alpha(theme.meridian.surfaces.ground, 0.92),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${theme.meridian.borders.muted}`,
          borderRadius: 2,
          maxWidth: 720,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
            {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
          </Typography>

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {/* Titulo */}
            <Controller
              name="titulo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Titulo"
                  fullWidth
                  error={!!errors.titulo}
                  helperText={errors.titulo?.message}
                />
              )}
            />

            {/* Descripcion */}
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripcion"
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={10}
                  error={!!errors.descripcion}
                  helperText={errors.descripcion?.message}
                />
              )}
            />

            {/* Categoria + Prioridad */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="categoriaId"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.categoriaId} fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      label="Categoria"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {categorias?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.categoriaId && (
                      <FormHelperText>{errors.categoriaId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="prioridadId"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.prioridadId} fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      label="Prioridad"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {prioridades?.map((pri) => (
                        <MenuItem key={pri.id} value={pri.id}>
                          {pri.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.prioridadId && (
                      <FormHelperText>{errors.prioridadId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {/* Departamento */}
            <Controller
              name="departamento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Departamento (opcional)"
                  fullWidth
                />
              )}
            />

            {/* Acciones */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<X size={16} />}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save size={16} />}
                disabled={isSubmitting}
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Ticket'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TicketForm;
