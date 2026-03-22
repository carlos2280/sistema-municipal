import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

interface TrendInfo {
  value: number
  direction: 'up' | 'down'
}

interface KpiCardProps {
  icon: ReactNode
  value: number | string
  label: string
  color?: string
  format?: 'number' | 'percent' | 'hours'
  trend?: TrendInfo
  delay?: number
}

function formatValue(raw: number, format: KpiCardProps['format']): string {
  if (format === 'percent') return `${raw}%`
  if (format === 'hours') return `${raw}h`
  return String(raw)
}

interface AnimatedNumberProps {
  value: number
  format: KpiCardProps['format']
  delay?: number
}

function AnimatedNumber({ value, format, delay = 0 }: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion()
  const motionValue = useMotionValue(shouldReduceMotion ? value : 0)
  const spring = useSpring(motionValue, {
    duration: shouldReduceMotion ? 0 : 1200,
    bounce: 0,
  })
  const displayed = useTransform(spring, (v) => formatValue(Math.round(v), format))

  useEffect(() => {
    const timeout = setTimeout(() => {
      motionValue.set(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay, motionValue])

  return <motion.span>{displayed}</motion.span>
}

export function KpiCard({ icon, value, label, color, format = 'number', trend, delay = 0 }: KpiCardProps) {
  const theme = useTheme()
  const resolvedColor = color ?? theme.palette.primary.main
  const isNumeric = typeof value === 'number'

  return (
    <Card
      sx={{
        backgroundColor: theme.meridian.surfaces.s2,
        borderColor: theme.meridian.borders.default,
        transition: [
          `transform 150ms ${theme.meridian.easings.out}`,
          `box-shadow 150ms ${theme.meridian.easings.out}`,
          `border-color 150ms ${theme.meridian.easings.out}`,
        ].join(', '),
        willChange: 'transform',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.meridian.shadows.md,
          borderColor: theme.meridian.borders.strong,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: alpha(resolvedColor, 0.12),
            color: resolvedColor,
            flexShrink: 0,
            '& svg': { fontSize: 28 },
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="number"
            component="div"
            sx={{
              fontSize: '2.5rem',
              lineHeight: 1,
              color: theme.palette.text.primary,
            }}
          >
            {isNumeric ? (
              <AnimatedNumber value={value} format={format} delay={delay} />
            ) : (
              value
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Typography variant="label" component="div" color="text.secondary">
              {label}
            </Typography>
            {trend && (
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: trend.direction === 'up' ? theme.palette.success.main : theme.palette.error.main,
                }}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
