import * as controller from '@/controllers/prioridades.controller'
import { Router } from 'express'

const router: Router = Router()

router.get('/', controller.listar)

export default router
