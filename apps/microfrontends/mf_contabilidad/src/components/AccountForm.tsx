import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import type { FC } from 'react';
import type {
  FormData,
  FormType,
} from '../hooks/planesCuentas/usePlanDeCuentas';

interface Props {
  open: boolean;
  formType: FormType;
  formData: FormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    field: keyof FormData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AccountForm: FC<Props> = ({
  open,
  formType,
  formData,
  onClose,
  onSubmit,
  onChange,
}) => (
  <Collapse
    in={open}
    orientation="horizontal"
    sx={{
      flex: open ? '0 0 400px' : '0 0 0px',
      transition: 'flex 0.3s ease-in-out',
    }}
  >
    <Paper
      elevation={0}
      sx={{
        width: 400,
        height: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: formType === 'crear' ? 'success.main' : 'primary.main',
          }}
        >
          {formType === 'crear' ? 'Formulario Crear' : 'Formulario Editar'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </Box>
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}
        onSubmit={onSubmit}
      >
        <TextField
          label="Código de Cuenta"
          size="small"
          fullWidth
          required
          value={formData.code}
          onChange={onChange('code')}
        />
        <TextField
          label="Nombre de Cuenta"
          size="small"
          fullWidth
          required
          value={formData.name}
          onChange={onChange('name')}
        />
        <TextField
          label="Descripción"
          size="small"
          fullWidth
          multiline
          rows={4}
          value={formData.description}
          onChange={onChange('description')}
        />
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor:
                  formType === 'crear' ? 'success.main' : 'primary.main',
                '&:hover': {
                  backgroundColor:
                    formType === 'crear' ? 'success.dark' : 'primary.dark',
                },
              }}
            >
              {formType === 'crear' ? 'Crear' : 'Actualizar'}
            </Button>
            <Button variant="outlined" fullWidth onClick={onClose}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  </Collapse>
);
