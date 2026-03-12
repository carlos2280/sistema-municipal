import { Router } from 'express'
import conversacionesRouter from './conversaciones.route.js'
import gruposSistemaRouter from './gruposSistema.route.js'
import llamadasRouter from './llamadas.route.js'
import mensajesRouter from './mensajes.route.js'
import reunionesRouter from './reuniones.route.js'
import usuariosRouter from './usuarios.route.js'

const router = Router()

router.use('/conversaciones', conversacionesRouter)
router.use('/grupos-sistema', gruposSistemaRouter)
router.use('/usuarios', usuariosRouter)
router.use('/', mensajesRouter)
router.use('/', llamadasRouter)
router.use('/', reunionesRouter)

export default router
