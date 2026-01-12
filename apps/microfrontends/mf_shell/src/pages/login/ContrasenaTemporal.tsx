import { Alert } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { FormProvider } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import useContrasenaTemporal from '../../hook/useContrasenaTemporal';
import FormContrasenaTemporal from './form/FormContrasenaTemporal';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const ContrasenaTemporal = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? undefined;

  const { data, isLoading, isError, error, methods, handleSubmit } =
    useContrasenaTemporal(token);

  console.log({
    data,
    isError,
    isLoading,
    error,
  });

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <FormProvider {...methods}>
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            [M]
          </Typography>

          <Alert variant="filled" severity="warning">
            Debe modificar su contraseña.
          </Alert>

          {isError && (
            <Alert variant="filled" severity="error">
              Tiempo caducado, informe al administrador.
            </Alert>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormContrasenaTemporal />
            <Button
              size="large"
              fullWidth
              variant="contained"
              disabled={!methods.formState.isValid}
              onClick={methods.handleSubmit(handleSubmit)}
            >
              Cambiar contraseña
            </Button>
          </Box>
        </Card>
      </FormProvider>
    </SignInContainer>
  );
};

export default ContrasenaTemporal;
