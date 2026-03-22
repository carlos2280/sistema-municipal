import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import type { ControllerRenderProps } from 'react-hook-form'

interface PrioridadColorSelectProps {
  field: ControllerRenderProps<
    { nombre: string; color: string; slaHoras: number },
    'color'
  >
  colors: string[]
}

export function PrioridadColorSelect({
  field,
  colors,
}: PrioridadColorSelectProps) {
  const theme = useTheme()

  return (
    <Select
      {...field}
      size="small"
      fullWidth
      renderValue={(val: string) => (
        <Chip
          label={val}
          size="small"
          sx={{
            backgroundColor: val,
            color: theme.palette.common.white,
            fontWeight: 600,
          }}
        />
      )}
    >
      {colors.map((c) => (
        <MenuItem key={c} value={c}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: c,
                flexShrink: 0,
              }}
            />
            <Chip
              label={c}
              size="small"
              sx={{
                backgroundColor: c,
                color: theme.palette.common.white,
                fontWeight: 600,
              }}
            />
          </Box>
        </MenuItem>
      ))}
    </Select>
  )
}
