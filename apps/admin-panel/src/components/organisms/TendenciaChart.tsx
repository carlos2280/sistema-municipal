import { fontFamily } from '@/theme/tokens'
import type { TendenciaDia } from '@/types/mesa-ayuda'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TendenciaChartProps {
  data: TendenciaDia[]
  title?: string
}

export function TendenciaChart({
  data,
  title = 'Tendencia 30 días',
}: TendenciaChartProps) {
  const theme = useTheme()

  const colorCreados = theme.palette.primary.main
  const colorResueltos = theme.palette.success.main

  return (
    <Box>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradCreados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorCreados} stopOpacity={0.08} />
              <stop offset="95%" stopColor={colorCreados} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradResueltos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorResueltos} stopOpacity={0.08} />
              <stop offset="95%" stopColor={colorResueltos} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.meridian.borders.muted}
            vertical={false}
          />
          <XAxis
            dataKey="fecha"
            tickFormatter={(v: string) => v.slice(5)}
            tickLine={false}
            axisLine={false}
            tick={{
              fontFamily: fontFamily.sans,
              fill: theme.palette.text.secondary,
              fontSize: 11,
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontFamily: fontFamily.number,
              fill: theme.palette.text.secondary,
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: alpha(theme.meridian.surfaces.s4, 0.95),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.meridian.borders.default}`,
              borderRadius: theme.shape.borderRadius,
              fontFamily: fontFamily.sans,
              fontSize: 13,
            }}
            labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
            itemStyle={{ color: theme.palette.text.secondary }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: fontFamily.sans,
              fontSize: 12,
              paddingTop: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="creados"
            name="Creados"
            stroke={colorCreados}
            strokeWidth={2}
            fill="url(#gradCreados)"
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="resueltos"
            name="Resueltos"
            stroke={colorResueltos}
            strokeWidth={2}
            fill="url(#gradResueltos)"
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
