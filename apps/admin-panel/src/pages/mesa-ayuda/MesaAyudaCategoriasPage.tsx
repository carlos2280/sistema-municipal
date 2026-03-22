import { CategoriasTable } from '@/components/organisms'
import {
  useActualizarCategoria,
  useCrearCategoria,
  useEliminarCategoria,
  useMesaAyudaCategorias,
} from '@/hooks/useMesaAyudaCategorias'
import type { CreateCategoriaInput } from '@/types/mesa-ayuda'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export default function MesaAyudaCategoriasPage() {
  const { data: categorias = [], isLoading, error } = useMesaAyudaCategorias()
  const crearCategoria = useCrearCategoria()
  const actualizarCategoria = useActualizarCategoria()
  const eliminarCategoria = useEliminarCategoria()

  const isMutating =
    crearCategoria.isPending ||
    actualizarCategoria.isPending ||
    eliminarCategoria.isPending

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Error al cargar categorías: {error.message}
      </Alert>
    )
  }

  function handleCreateSubmit(data: CreateCategoriaInput) {
    crearCategoria.mutate(data)
  }

  function handleEditSubmit(id: number, data: CreateCategoriaInput) {
    actualizarCategoria.mutate({ id, data })
  }

  function handleDelete(id: number) {
    eliminarCategoria.mutate(id)
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Mesa de Ayuda — Categorías
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Catálogo global — aplica a todas las municipalidades
      </Typography>

      <CategoriasTable
        data={categorias}
        isLoading={isLoading}
        onCreateSubmit={handleCreateSubmit}
        onEditSubmit={handleEditSubmit}
        onDelete={handleDelete}
        isMutating={isMutating}
      />
    </Box>
  )
}
