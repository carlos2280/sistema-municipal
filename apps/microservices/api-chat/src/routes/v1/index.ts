import { Router } from 'express'
import conversacionesRouter from './conversaciones.route.js'
import mensajesRouter from './mensajes.route.js'
import usuariosRouter from './usuarios.route.js'

const router = Router()

router.use('/conversaciones', conversacionesRouter)
router.use('/usuarios', usuariosRouter)
router.use('/', mensajesRouter)

export default router
