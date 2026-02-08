import { Router } from 'express'
import {
  crearConversacionDirecta,
  crearGrupo,
  obtenerConversacion,
  obtenerConversaciones,
} from '../../controllers/conversaciones.controller.js'
import { verificarToken } from '../../libs/middleware/verficarToken.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(verificarToken)

// GET /api/chat/v1/conversaciones
router.get('/', obtenerConversaciones)

// GET /api/chat/v1/conversaciones/:id
router.get('/:id', obtenerConversacion)

// POST /api/chat/v1/conversaciones/directa
router.post('/directa', crearConversacionDirecta)

// POST /api/chat/v1/conversaciones/grupo
router.post('/grupo', crearGrupo)

export default router
