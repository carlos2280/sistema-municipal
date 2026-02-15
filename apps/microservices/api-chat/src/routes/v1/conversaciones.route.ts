import { Router } from 'express'
import {
  agregarParticipante,
  crearConversacionDirecta,
  crearGrupo,
  eliminarParticipante,
  obtenerConversacion,
  obtenerConversaciones,
  obtenerParticipantesConUsuario,
  renombrarGrupo,
} from '../../controllers/conversaciones.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(extractUser)

// GET /api/chat/v1/conversaciones
router.get('/', obtenerConversaciones)

// GET /api/chat/v1/conversaciones/:id
router.get('/:id', obtenerConversacion)

// POST /api/chat/v1/conversaciones/directa
router.post('/directa', crearConversacionDirecta)

// POST /api/chat/v1/conversaciones/grupo
router.post('/grupo', crearGrupo)

// GET /api/chat/v1/conversaciones/:id/participantes
router.get('/:id/participantes', obtenerParticipantesConUsuario)

// POST /api/chat/v1/conversaciones/:id/participantes
router.post('/:id/participantes', agregarParticipante)

// DELETE /api/chat/v1/conversaciones/:id/participantes/:usuarioId
router.delete('/:id/participantes/:usuarioId', eliminarParticipante)

// PATCH /api/chat/v1/conversaciones/:id/nombre
router.patch('/:id/nombre', renombrarGrupo)

export default router
