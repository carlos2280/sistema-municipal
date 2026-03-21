import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TendenciaDia } from '@/types/mesa-ayuda'

interface TendenciaChartProps {
  data: TendenciaDia[]
  title?: string
}

export function TendenciaChart({ data, title = 'Tendencia 30 días' }: TendenciaChartProps) {
  const theme = useTheme()

  return (
    <Box>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="fecha"
            tickFormatter={(v: string) => v.slice(5)}
            fontSize={12}
            stroke={theme.palette.text.secondary}
          />
          <YAxis fontSize={12} stroke={theme.palette.text.secondary} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="creados"
            name="Creados"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="resueltos"
            name="Resueltos"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
