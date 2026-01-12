import { Alert, Box, Chip, Fade, FormHelperText, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AlertTriangle } from 'lucide-react';
import type React from 'react';
import type { FieldError } from 'react-hook-form';

type RenderErrorProps = {
  error: FieldError | undefined;
  errorStyle?: 'alert' | 'helper' | 'chip' | 'minimal';
};

const RenderError: React.FC<RenderErrorProps> = ({ error, errorStyle }) => {
  if (!error?.message) return null;

  switch (errorStyle) {
    case 'alert':
      return (
        <Fade in timeout={300}>
          <Alert
            severity="error"
            variant="outlined"
            icon={<AlertTriangle size={18} />}
            sx={{
              mt: 1.5,
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'grey.50',
              borderColor: 'error.light',
              color: 'error.dark',
              '& .MuiAlert-message': {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
              '& .MuiAlert-icon': {
                color: 'error.main',
              },
            }}
          >
            {error.message}
          </Alert>
        </Fade>
      );

    case 'chip':
      return (
        <Fade in timeout={300}>
          <Box sx={{ mt: 1.5 }}>
            <Chip
              icon={<AlertTriangle size={14} />}
              label={error.message}
              variant="outlined"
              size="small"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                height: '28px',
                backgroundColor: 'grey.50',
                borderColor: 'error.light',
                color: 'error.dark',
                '& .MuiChip-label': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                },
                '& .MuiChip-icon': {
                  color: 'error.main',
                },
              }}
            />
          </Box>
        </Fade>
      );

    case 'minimal':
      return (
        <Fade in timeout={300}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            // sx={{ mt: 1 }}
          >
            <Alert
              variant="filled"
              severity="error"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.85),
                width: '1',
              }}
            >
              {error.message}
            </Alert>
          </Stack>
        </Fade>
      );

    default:
      return (
        <Fade in timeout={300}>
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: '6px',
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.75,
              transition: 'all 0.15s ease-in-out',
            }}
          >
            <AlertTriangle
              size={16}
              style={{
                color: 'rgb(211, 47, 47)',
                marginTop: '1px',
                flexShrink: 0,
              }}
            />
            <FormHelperText
              sx={{
                color: 'text.primary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                margin: 0,
                lineHeight: 1.4,
                letterSpacing: '0.01em',
              }}
            >
              {error.message}
            </FormHelperText>
          </Box>
        </Fade>
      );
  }
};

export default RenderError;
