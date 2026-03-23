# [SEC-001] Correcciones de Seguridad Criticas — Auditoria 2026-03-22

## Metadata
- **Modulos**: api-autorizacion, api-identidad, api-contabilidad, api-platform, api-chat, api-mesa-ayuda, api-gateway, packages/seeders
- **Prioridad**: critica
- **Estado**: completado
- **Fecha**: 2026-03-22
- **Origen**: Auditoria automatizada — reportes 01-db-audit.md, 02-backend-audit.md

## Objetivo
Corregir todas las vulnerabilidades de seguridad criticas encontradas en la auditoria. Estas no son mejoras — son defectos que comprometen la integridad, confidencialidad y trazabilidad del sistema en produccion.

## Alcance

### Incluye
- S1: Reemplazar `Math.random()` por `crypto.randomBytes()` en backup codes MFA
- S2: Corregir CORS en los 5 microservicios con configuracion insegura
- S3: Eliminar log de token de seguridad en texto plano
- S4: Implementar blacklist de refresh tokens (tabla + verificacion en refresh)
- S5: Subir bcrypt rounds de 10 a 12 en todos los servicios
- S6: Resolver `userId = 1` hardcodeado en audit trail de mesa de ayuda
- S7: Proteger Swagger UI en produccion (api-identidad, api-contabilidad)
- S8: Eliminar hash de contrasena hardcodeado del seeder de usuarios
- S9: Dejar de enviar contrasena temporal en texto plano por email
- S10: Corregir `rejectUnauthorized: false` — documentar o condicionar a env

### NO incluye
- Rate limiting en microservicios individuales (mejora futura, no critica inmediata)
- Helmet en microservicios individuales (el gateway ya lo tiene)
- Refactoring general de codigo

## Especificacion

### S1 — Math.random en backup codes MFA
**Archivo**: `api-autorizacion/src/services/autorizacion.service.ts:636-638`
**Problema**: `Math.random()` es un PRNG no criptografico. Los backup codes son predecibles.
**Solucion**: Reutilizar la funcion `generateBackupCodes()` de `api-identidad/src/services/mfa.service.ts:60-65` que ya usa `crypto.randomBytes`. Opciones:
1. Promover `generateBackupCodes()` a `@municipal/core/auth`
2. Copiar el patron (menos ideal pero rapido)

### S2 — CORS inseguro en 5 de 7 microservicios
**Archivos y problema**:
| Servicio | Archivo | Config actual | Riesgo |
|---|---|---|---|
| api-identidad | `src/app.ts:24` | `cors()` sin args | Wildcard `*` |
| api-platform | `src/app.ts:27` | `cors()` sin args | Wildcard `*` |
| api-autorizacion | `src/app.ts:37` | `origin: true` | Refleja cualquier origin con credentials |
| api-contabilidad | `src/app.ts:27` | `origin: true` | Refleja cualquier origin con credentials |
| api-mesa-ayuda | `src/app.ts:20` | `origin: true` | Refleja cualquier origin con credentials |

**Solucion**: Para servicios internos detras del gateway, la opcion mas segura es eliminar CORS (`cors({ origin: false })`) o usar un origin explicito desde `env.CORS_ORIGIN`. Referencia correcta: `api-chat` que usa `cors({ origin: env.CORS_ORIGIN, credentials: true })`.

### S3 — Log de token de seguridad en texto plano
**Archivo**: `api-autorizacion/src/services/autorizacion.service.ts:504`
**Problema**: `console.log("cambiarContrasenaTemporal", { token })` expone el token temporal en logs.
**Solucion**: Eliminar el log o reemplazar por Pino con el token truncado (ultimos 8 chars max).

### S4 — Refresh tokens sin blacklist
**Problema**: Al hacer logout solo se limpia la cookie. El refresh token sigue valido 7 dias.
**Solucion**:
1. Crear tabla `refresh_tokens` en schema identidad:
   ```
   refresh_tokens (id, jti text unique, usuario_id FK, revocado boolean default false, expires_at timestamp, created_at)
   ```
2. Al emitir refresh token: guardar `jti` en la tabla
3. Al hacer logout: marcar `revocado = true`
4. Al refrescar: verificar que el `jti` no este revocado
5. Job de limpieza: eliminar tokens expirados periodicamente

### S5 — bcrypt rounds insuficientes
**Archivos**: `api-identidad/src/services/usuarios.service.ts:39,86`, `api-autorizacion/src/services/autorizacion.service.ts:522`
**Problema**: 10 rounds (estandar 2011). El propio `mfa.service.ts` ya usa 12.
**Solucion**: Centralizar `BCRYPT_ROUNDS = 12` en `@municipal/core/auth` y usarlo en todos los servicios. Los hashes existentes siguen funcionando (bcrypt es autoidentificable), los nuevos se generan con 12.

### S6 — userId hardcodeado en audit trail
**Archivo**: `api-platform/src/controllers/admin/mesaAyuda.controller.ts:89,193`
**Problema**: `ejecutadoPor = 1` y `autorId = 1` hardcodeados. Todo el audit trail de mesa de ayuda es falso.
**Solucion**: El controlador ya tiene `requireAdminKey` middleware. Agregar extraccion de usuario del JWT o de un header `x-admin-user-id` inyectado por el gateway admin.

### S7 — Swagger expuesto sin auth en produccion
**Archivos**: `api-identidad/src/app.ts:30`, `api-contabilidad/src/app.ts`
**Solucion**: Condicionar la ruta `/api-docs` a `NODE_ENV !== "production"` o protegerla con `requireAdminKey`.

### S8 — Hash de contrasena hardcodeado en seeder
**Archivo**: `packages/seeders/src/usuarios.seeder.ts:5`
**Problema**: `PASSWORD_HASH` con bcrypt de "password123" va directo a produccion.
**Solucion**: Generar contrasenas aleatorias en runtime con `crypto.randomBytes(16).toString('hex')` y marcar `passwordTemp: true` para forzar cambio en primer login. Alternativa: leer contrasena de variable de entorno `SEED_ADMIN_PASSWORD`.

### S9 — Contrasena temporal en email
**Archivo**: `api-identidad/src/services/email.service.ts:79`
**Problema**: `<p>Tu contrasena temporal es: <strong>${passwordTemporal}</strong></p>`
**Solucion**: Enviar solo un link con token temporal (ya existe el mecanismo de tokens temporales). El usuario define su contrasena al hacer click.

### S10 — rejectUnauthorized: false en SSL
**Archivos**: Todos los `db/client.ts`
**Solucion**: Condicionar a `process.env.NODE_ENV === 'production' && process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'`. Documentar con comentario `// Railway usa certificados self-signed`.

## Criterios de Aceptacion
- [x] S1: Backup codes MFA generados con `crypto.randomBytes` — centralizado en `@municipal/core/auth`
- [x] S2: Ningun microservicio tiene `cors()` sin args ni `origin: true` — grep confirma 0 resultados
- [x] S3: Grep por `console.log.*token` retorna 0 resultados en todo el backend
- [x] S4: Tabla `refresh_tokens` creada, logout revoca token, refresh verifica revocacion
- [x] S5: Grep por `bcrypt.*10` retorna 0 — todos usan 12 rounds via constante centralizada
- [x] S6: `ejecutadoPor` y `autorId` se extraen del header `x-admin-user-id`/`x-admin-user-name`, no son `1`
- [x] S7: Swagger no accesible cuando `NODE_ENV=production`
- [x] S8: Seeder no contiene hash de contrasena fijo — genera dinamicamente con `crypto.randomBytes` + bcrypt 12
- [x] S9: Email de bienvenida no envia contrasena en texto plano — muestra mensaje de cambio en primer login
- [x] S10: `rejectUnauthorized` controlado por `DB_SSL_REJECT_UNAUTHORIZED` (default true en prod)

## Restricciones
- NO romper el flujo de login existente (S4 debe ser retrocompatible con tokens ya emitidos)
- NO cambiar la API publica de los endpoints (S6 es cambio interno)
- S5 no requiere rehashear contrasenas existentes — se actualizan en el proximo login
- Los cambios de CORS (S2) deben testearse con el frontend en Railway antes de mergear

## Notas
- Orden de implementacion sugerido: S1 → S3 → S8 → S2 → S5 → S7 → S6 → S9 → S4 → S10
- S1 y S3 son fixes de 5 minutos con impacto critico
- S4 es el mas complejo (requiere migracion + cambios en 2 servicios)
- Referencia: OWASP Top 10 2021, ASVS v4.0
