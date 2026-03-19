import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { UserAvatar } from 'mf_ui/components'

interface ContactItemProps {
  id: number
  nombre: string
  email: string
  online?: boolean
  onClick?: () => void
}

export function ContactItem({
  nombre,
  email,
  online = false,
  onClick,
}: ContactItemProps) {
  const theme = useTheme()

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.75,
        cursor: 'pointer',
        borderBottom: `1px solid ${theme.meridian.borders.muted}`,
        '&:hover': {
          bgcolor: theme.meridian.surfaces.s3,
        },
      }}
    >
      {/* Avatar — reutiliza UserAvatar de mf_ui */}
      <UserAvatar
        name={nombre}
        size="md"
        status={online ? 'online' : 'offline'}
      />

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: '13.5px',
            fontFamily: '"DM Sans", sans-serif',
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {nombre}
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            fontFamily: '"DM Sans", sans-serif',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </Typography>
      </Box>
    </Box>
  )
}
