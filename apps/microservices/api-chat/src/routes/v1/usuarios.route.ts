import { Router } from 'express'
import { usuariosController } from '../../controllers/usuarios.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

// GET /api/chat/v1/usuarios?q=maria&limit=20
router.get('/', extractUser, usuariosController.buscarUsuarios)

export default router
