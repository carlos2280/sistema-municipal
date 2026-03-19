import { SystemGroupBadge } from '@/components/atoms'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { Building2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAvatarColor } from '@/utils'

interface ConversationItemProps {
  id: number
  nombre: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
  tipo: 'directa' | 'grupo'
  sistema?: boolean
  isActive?: boolean
  onClick?: () => void
  /** Índice para stagger animation (max 6) */
  staggerIndex?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const MotionBox = motion.create(Box)

export function ConversationItem({
  nombre,
  ultimoMensaje,
  hora,
  noLeidos,
  online,
  tipo,
  sistema,
  isActive,
  onClick,
  staggerIndex = 0,
}: ConversationItemProps) {
  const theme = useTheme()
  const avatarColor = getAvatarColor(nombre, theme)

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(staggerIndex, 5) * 0.06,
        ease: [0.0, 0.0, 0.2, 1.0],
      }}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.12)
          : 'transparent',
        borderBottom: `1px solid ${theme.meridian.borders.muted}`,
        transition: 'transform 150ms, background-color 0s',
        '&:hover': {
          bgcolor: isActive
            ? alpha(theme.palette.primary.main, 0.12)
            : theme.meridian.surfaces.s3,
          transform: 'translateY(-2px)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': {
            bgcolor: isActive
              ? alpha(theme.palette.primary.main, 0.12)
              : theme.meridian.surfaces.s3,
            transform: 'none',
          },
        },
      }}
    >
      {/* Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: tipo === 'grupo' ? 2 : '50%',
            bgcolor: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {tipo === 'grupo' ? (
            sistema ? (
              <Building2 size={20} />
            ) : (
              <Users size={20} />
            )
          ) : (
            getInitials(nombre)
          )}
        </Box>
        {tipo === 'directa' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: online ? 'success.main' : theme.palette.grey[500],
              border: `2px solid ${theme.meridian.surfaces.ground}`,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: noLeidos > 0 ? 600 : 500,
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
            {sistema && <SystemGroupBadge />}
          </Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontFamily: '"Space Grotesk", sans-serif',
              fontFeatureSettings: "'tnum' 1",
              color: noLeidos > 0 ? 'primary.main' : 'text.secondary',
              fontWeight: noLeidos > 0 ? 600 : 400,
              flexShrink: 0,
              ml: 1,
            }}
          >
            {hora}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0.25,
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"DM Sans", sans-serif',
              color: noLeidos > 0 ? 'text.primary' : 'text.secondary',
              fontWeight: noLeidos > 0 ? 500 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ultimoMensaje}
          </Typography>
          {noLeidos > 0 && (
            <Badge
              badgeContent={noLeidos}
              color="primary"
              sx={{
                ml: 1,
                '& .MuiBadge-badge': {
                  fontSize: 11,
                  height: 18,
                  minWidth: 18,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontFeatureSettings: "'tnum' 1",
                },
              }}
            />
          )}
        </Box>
      </Box>
    </MotionBox>
  )
}
