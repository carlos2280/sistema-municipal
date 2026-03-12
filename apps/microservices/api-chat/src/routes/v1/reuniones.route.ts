import { Router } from 'express'
import { reunionesController } from '../../controllers/reuniones.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

router.use(extractUser)

// Próximas reuniones del usuario (cross-conversación) — antes de /:id para evitar colisión
router.get('/reuniones/proximas', reunionesController.proximas)

// CRUD de reunión
router.get('/reuniones/:id', reunionesController.detalle)
router.patch('/reuniones/:id', reunionesController.editar)
router.delete('/reuniones/:id', reunionesController.cancelar)

// Acciones sobre reunión
router.patch('/reuniones/:id/rsvp', reunionesController.rsvp)
router.post('/reuniones/:id/iniciar', reunionesController.iniciar)

// Reuniones por conversación
router.get('/conversaciones/:id/reuniones', reunionesController.listar)
router.post('/conversaciones/:id/reuniones', reunionesController.crear)

export default router
