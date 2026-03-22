import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  ctaLabel?: string
  onCta?: () => void
}

export function EmptyState({ icon: Icon, message, ctaLabel, onCta }: EmptyStateProps) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 6,
        px: 2,
      }}
    >
      <Icon size={48} color={theme.palette.text.disabled} strokeWidth={1.5} />
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      {ctaLabel && onCta && (
        <Button
          variant="outlined"
          size="small"
          onClick={onCta}
          sx={{
            mt: 0.5,
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          {ctaLabel}
        </Button>
      )}
    </Box>
  )
}
