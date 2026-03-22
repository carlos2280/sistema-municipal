import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface SuccessSnackbarProps {
  open: boolean
  message: string
  onClose: () => void
  duration?: number
}

export function SuccessSnackbar({
  open,
  message,
  onClose,
  duration = 4000,
}: SuccessSnackbarProps) {
  const theme = useTheme()

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      aria-live="polite"
    >
      <Box
        component="output"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: '8px',
          backgroundColor: theme.meridian.surfaces.s4,
          border: `1px solid ${theme.meridian.borders.default}`,
          boxShadow: theme.meridian.shadows.md,
          minWidth: 280,
        }}
      >
        <CheckCircleIcon
          sx={{
            color: theme.palette.success.main,
            fontSize: 20,
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" fontWeight={500} color="text.primary">
          {message}
        </Typography>
      </Box>
    </Snackbar>
  )
}
