import categorias from '@/routes/v1/categorias.route'
import comentarios from '@/routes/v1/comentarios.route'
import prioridades from '@/routes/v1/prioridades.route'
import tickets from '@/routes/v1/tickets.route'
import { Router } from 'express'

const router: Router = Router()

router.use('/tickets', tickets)
router.use('/tickets/:id/comentarios', comentarios)
router.use('/categorias', categorias)
router.use('/prioridades', prioridades)

export default router
