import { Router } from 'express'
import {
  obtenerHistorial,
  obtenerTokenLlamada,
} from '../../controllers/llamadas.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

router.use(extractUser)

// GET /api/chat/v1/conversaciones/:conversacionId/llamadas
router.get('/conversaciones/:conversacionId/llamadas', obtenerHistorial)

// GET /api/chat/v1/llamadas/:llamadaId/token
router.get('/llamadas/:llamadaId/token', obtenerTokenLlamada)

export default router
