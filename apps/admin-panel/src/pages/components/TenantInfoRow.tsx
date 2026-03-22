import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

interface TenantInfoRowProps {
  label: string
  value: React.ReactNode
}

export function TenantInfoRow({ label, value }: TenantInfoRowProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid size={{ xs: 4 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 8 }}>
        <Typography variant="body2">{value || '—'}</Typography>
      </Grid>
    </Grid>
  )
}
