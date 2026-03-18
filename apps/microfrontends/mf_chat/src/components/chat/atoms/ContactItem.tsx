import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface ContactItemProps {
  id: number
  nombre: string
  email: string
  online?: boolean
  onClick?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    '#10B981', // green
    '#7928CA', // purple
    '#F59E0B', // amber
    '#6366F1', // indigo
    '#EF4444', // red
    '#EC4899', // pink
    '#2563EB', // blue
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
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
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      }}
    >
      {/* Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: getAvatarColor(nombre),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {getInitials(nombre)}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: online ? 'success.main' : 'grey.400',
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 14,
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
            fontSize: 12,
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
