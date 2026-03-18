---
paths:
  - "apps/microservices/**/*.ts"
  - "packages/core/**/*.ts"
---

# Microservicios Node.js — Convenciones

## Express 5: async errors sin try/catch en routes
Express 5 propaga errores async automáticamente. Patrón obligatorio:

```typescript
// ✅ Correcto — Express 5 captura el error y lo pasa al error handler
export const getById = async (req: Request, res: Response): Promise<void> => {
  const item = await service.findById(req.params.id);
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ data: item });
};

// ❌ Incorrecto — try/catch innecesario en Express 5
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try { ... } catch (err) { next(err); }
};
```

## Validación: Zod siempre antes del controller
```typescript
// middleware de validación → luego el controller
router.post('/', validate(createSchema), controller.create);
```
- `z.infer<typeof schema>` como tipo del body validado
- NUNCA acceder a `req.body` sin validar antes

## Estructura interna de cada microservicio
```
src/
├── routes/       → Solo definición de rutas + middleware
├── controllers/  → Request/Response, delegar a services
├── services/     → Lógica de negocio, llaman a DB
├── middleware/   → Auth, validación, errores
├── types/        → Tipos locales del servicio
└── config/       → Variables de entorno (con Zod parse al inicio)
```

## Logging: Pino, nunca console.log
```typescript
import { logger } from '@municipal/core/logger';
logger.info({ userId, action: 'login' }, 'Usuario autenticado');  // structured
logger.error({ err, userId }, 'Error en autenticación');
```

## Errores: usar clases de @municipal/core
```typescript
import { NotFoundError, UnauthorizedError } from '@municipal/core/errors';
throw new NotFoundError('Usuario no encontrado');
// Express 5 + error handler global lo convierte en la respuesta HTTP correcta
```

## Seguridad (OWASP — aplicar siempre)
- JWT verificado en middleware, nunca en el controller directamente
- Rate limiting en rutas de auth (ya configurado en api-gateway)
- NUNCA loguear contraseñas, tokens, ni datos sensibles
- Principio de mínimo privilegio: verificar permisos RBAC antes de la operación
