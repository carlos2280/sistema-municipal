import { Router } from 'express'
import {
  crearMensaje,
  editarMensaje,
  eliminarMensaje,
  obtenerMensajes,
} from '../../controllers/mensajes.controller.js'
import { validate } from '../../libs/middleware/validate.js'
import { extractUser } from '../../libs/middleware/extractUser.js'
import { crearMensajeSchema, editarMensajeSchema } from '../../libs/schemas/mensajes.schemas.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(extractUser)

// GET /api/chat/v1/conversaciones/:conversacionId/mensajes
router.get('/conversaciones/:conversacionId/mensajes', obtenerMensajes)

// POST /api/chat/v1/conversaciones/:conversacionId/mensajes
router.post('/conversaciones/:conversacionId/mensajes', validate(crearMensajeSchema), crearMensaje)

// PUT /api/chat/v1/mensajes/:id
router.put('/mensajes/:id', validate(editarMensajeSchema), editarMensaje)

// DELETE /api/chat/v1/mensajes/:id
router.delete('/mensajes/:id', eliminarMensaje)

export default router
