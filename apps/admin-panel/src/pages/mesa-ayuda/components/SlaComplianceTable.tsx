import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { SlaProgressBar } from '@/components/molecules'

interface ComplianceRow {
  id: number
  nombre: string
  total: number
  vencidos: number
  compliance: number
}

interface SlaComplianceTableProps {
  title: string
  rows: ComplianceRow[]
  emptyMessage?: string
}

export function SlaComplianceTable({ title, rows, emptyMessage = 'Sin datos' }: SlaComplianceTableProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{title}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{title.includes('Prioridad') ? 'Prioridad' : 'Municipalidad'}</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Vencidos</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Compliance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={row.vencidos > 0 ? 700 : 600}
                    color={row.vencidos > 0 ? 'error.main' : 'text.primary'}
                  >
                    {row.nombre}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{row.total}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={row.vencidos > 0 ? 'error.main' : 'text.primary'}
                    fontWeight={row.vencidos > 0 ? 700 : 400}
                  >
                    {row.vencidos}
                  </Typography>
                </TableCell>
                <TableCell>
                  <SlaProgressBar compliance={row.compliance} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
