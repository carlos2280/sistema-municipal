import * as controller from '@/controllers/categorias.controller'
import { validate } from '@/libs/middleware/validate'
import {
  actualizarCategoriaSchema,
  crearCategoriaSchema,
} from '@/libs/schemas/categorias.schemas'
import { Router } from 'express'

const router: Router = Router()

router.get('/', controller.listar)
router.post('/', validate(crearCategoriaSchema), controller.crear)
router.patch('/:id', validate(actualizarCategoriaSchema), controller.actualizar)
router.delete('/:id', controller.desactivar)

export default router
