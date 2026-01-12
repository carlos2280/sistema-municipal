import { FormProvider, type UseFormReturn } from 'react-hook-form';

import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { X } from 'lucide-react';

import type { TSchemaPlanesCuentasCreate } from '../../../types/zod/planesCuentas.zod';
import FormularioCrearCuenta from './FormularioCrearCuenta';
type Props = {
  open: boolean;
  onClose: () => void;
  methods: UseFormReturn<TSchemaPlanesCuentasCreate>;

  onSubmit: (data: TSchemaPlanesCuentasCreate) => Promise<void>;
};
const FormularioBase = ({ methods, onSubmit, open, onClose }: Props) => {
  console.log(methods.getValues());
  const combreCuenta = methods.getValues('valorPadre');
  return (
    <Collapse
      in={open}
      orientation="horizontal"
      sx={{
        flex: open ? '0 0 400px' : '0 0 0px',
        transition: 'flex 0.3s ease-in-out',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          width: 400,
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          //border: (theme) => `1px solid ${theme.palette.divider}`,
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
              fontWeight: 500,
              // color: "success.main",
            }}
          >
            {`Crear cuenta a ${combreCuenta}`}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Box>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
          }}
          // onSubmit={onSubmit}
        >
          <FormProvider {...methods}>
            <FormularioCrearCuenta />
          </FormProvider>
        </Box>
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              color="primary"
              disabled={!methods?.formState.isValid}
              onClick={methods?.handleSubmit(onSubmit)}
            >
              {'Crear'}
            </Button>
            <Button variant="outlined" fullWidth onClick={onClose}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Collapse>
  );
};

export default FormularioBase;
