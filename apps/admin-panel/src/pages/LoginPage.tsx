import logoCriscarLight from '@/assets/logo-criscar-light.svg'
import { useAuth } from '@/hooks/useAuth'
import { pageTransition } from '@/theme/motion'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// hardcoded: efecto glassmorphism y mesh gradient — sin equivalente semántico en el theme
const GLASS_CARD_BG = 'rgba(255, 255, 255, 0.04)'
const GLASS_CARD_BORDER = 'rgba(255, 255, 255, 0.08)'
const MESH_GRADIENT = `
  radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0,188,212,0.08) 0%, transparent 60%),
  radial-gradient(ellipse 60% 80% at 80% 70%, rgba(0,80,120,0.12) 0%, transparent 60%),
  radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,188,212,0.04) 0%, transparent 70%)
`

export default function LoginPage() {
  const theme = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return
    setLoading(true)
    setError('')
    const success = await login(apiKey.trim())
    if (success) {
      navigate('/', { replace: true })
    } else {
      setError('Clave API inválida')
    }
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.meridian.surfaces.void,
        '@keyframes meshShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: MESH_GRADIENT,
          backgroundSize: '200% 200%',
          animation: 'meshShift 25s ease infinite',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        },
      }}
    >
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        style={{
          width: '100%',
          maxWidth: 400,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            background: GLASS_CARD_BG,
            backdropFilter: 'blur(24px)',
            border: `1px solid ${GLASS_CARD_BORDER}`,
            borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            boxShadow: theme.meridian.shadows.lg,
          }}
        >
          <Box
            component="img"
            src={logoCriscarLight}
            alt="CRISCAR"
            sx={{ height: 40, mb: 1 }}
          />

          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Panel Administrativo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu clave de acceso para continuar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Clave API"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoFocus
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowKey(!showKey)}
                        edge="end"
                        size="small"
                      >
                        {showKey ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !apiKey.trim()}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
            Powered by CRISCAR
          </Typography>
        </Box>
      </motion.div>
    </Box>
  )
}
