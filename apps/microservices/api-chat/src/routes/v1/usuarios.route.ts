import { Router } from 'express'
import { usuariosController } from '../../controllers/usuarios.controller.js'
import { verificarToken } from '../../libs/middleware/verficarToken.js'

const router = Router()

// GET /api/chat/v1/usuarios?q=maria&limit=20
router.get('/', verificarToken, usuariosController.buscarUsuarios)

export default router
