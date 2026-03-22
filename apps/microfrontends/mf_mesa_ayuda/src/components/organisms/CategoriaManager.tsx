import type { Categoria } from '@/types/mesa-ayuda.types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import {
  useCreateCategoriaMutation,
  useDeleteCategoriaMutation,
  useGetCategoriasQuery,
  useUpdateCategoriaMutation,
} from 'mf_store/store'
import { useCallback, useState } from 'react'

interface CategoriaFormData {
  codigo: string
  nombre: string
  descripcion: string
  icono: string
  color: string
  orden: number
}

const EMPTY_FORM: CategoriaFormData = {
  codigo: '',
  nombre: '',
  descripcion: '',
  icono: 'tag',
  color: '#6366f1',
  orden: 0,
}

function CategoriaManager() {
  const theme = useTheme()
  const { data: categorias, isLoading } = useGetCategoriasQuery()
  const [createCategoria, createState] = useCreateCategoriaMutation()
  const [updateCategoria, updateState] = useUpdateCategoriaMutation()
  const [deleteCategoria] = useDeleteCategoriaMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoriaFormData>(EMPTY_FORM)

  const handleOpenCreate = useCallback(() => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setDialogOpen(true)
  }, [])

  const handleOpenEdit = useCallback((cat: Categoria) => {
    setEditingId(cat.id)
    setFormData({
      codigo: cat.codigo,
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
      icono: cat.icono,
      color: cat.color,
      orden: cat.orden,
    })
    setDialogOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setDialogOpen(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }, [])

  const handleSave = useCallback(async () => {
    if (editingId) {
      await updateCategoria({
        id: editingId,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        icono: formData.icono,
        color: formData.color,
        orden: formData.orden,
      })
    } else {
      await createCategoria({
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        icono: formData.icono,
        color: formData.color,
        orden: formData.orden,
      })
    }
    handleClose()
  }, [editingId, formData, createCategoria, updateCategoria, handleClose])

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteCategoria(id)
    },
    [deleteCategoria],
  )

  const handleToggleActivo = useCallback(
    async (cat: Categoria) => {
      await updateCategoria({ id: cat.id, activo: !cat.activo })
    },
    [updateCategoria],
  )

  const updateField = useCallback(
    <K extends keyof CategoriaFormData>(
      key: K,
      value: CategoriaFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  if (isLoading) {
    return <Skeleton variant="rounded" height={400} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: alpha(theme.meridian.surfaces.ground, 0.92),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${theme.meridian.borders.muted}`,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              Categorias
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleOpenCreate}
            >
              Nueva Categoria
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Color</TableCell>
                  <TableCell>Codigo</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripcion</TableCell>
                  <TableCell>Orden</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                        }}
                      />
                    </TableCell>
                    <TableCell>{cat.codigo}</TableCell>
                    <TableCell>{cat.nombre}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 200 }}
                      >
                        {cat.descripcion ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{cat.orden}</TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={cat.activo}
                        onChange={() => handleToggleActivo(cat)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Edit2 size={14} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(cat.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Categoria' : 'Nueva Categoria'}
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
        >
          {!editingId && (
            <TextField
              label="Codigo"
              value={formData.codigo}
              onChange={(e) => updateField('codigo', e.target.value)}
              fullWidth
              size="small"
            />
          )}
          <TextField
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Descripcion"
            value={formData.descripcion}
            onChange={(e) => updateField('descripcion', e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          <TextField
            label="Icono (lucide name)"
            value={formData.icono}
            onChange={(e) => updateField('icono', e.target.value)}
            fullWidth
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => updateField('color', e.target.value)}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="Orden"
              type="number"
              value={formData.orden}
              onChange={(e) => updateField('orden', Number(e.target.value))}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !formData.nombre.trim() ||
              createState.isLoading ||
              updateState.isLoading
            }
          >
            {editingId ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  )
}

export default CategoriaManager
