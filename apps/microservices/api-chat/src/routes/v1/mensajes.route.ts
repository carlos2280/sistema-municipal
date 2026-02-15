import { Router } from 'express'
import {
  crearMensaje,
  editarMensaje,
  eliminarMensaje,
  obtenerMensajes,
} from '../../controllers/mensajes.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(extractUser)

// GET /api/chat/v1/conversaciones/:conversacionId/mensajes
router.get('/conversaciones/:conversacionId/mensajes', obtenerMensajes)

// POST /api/chat/v1/conversaciones/:conversacionId/mensajes
router.post('/conversaciones/:conversacionId/mensajes', crearMensaje)

// PUT /api/chat/v1/mensajes/:id
router.put('/mensajes/:id', editarMensaje)

// DELETE /api/chat/v1/mensajes/:id
router.delete('/mensajes/:id', eliminarMensaje)

export default router
