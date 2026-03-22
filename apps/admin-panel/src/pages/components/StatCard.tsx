import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        backgroundColor: theme.meridian.surfaces.s2,
        borderColor: theme.meridian.borders.default,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color, fontSize: 40, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography
            component="div"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontFeatureSettings: "'tnum' 1, 'ss01' 1",
              fontWeight: 500,
              fontSize: '2rem',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
