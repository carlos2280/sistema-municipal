import { Router } from 'express'
import { sincronizarGruposSistema } from '../../controllers/gruposSistema.controller.js'
import { extractUser } from '../../libs/middleware/extractUser.js'

const router = Router()

router.use(extractUser)

// POST /api/chat/v1/grupos-sistema/sync
router.post('/sync', sincronizarGruposSistema)

export default router
