# Seguridad — Reglas Obligatorias

## Secrets y credenciales
- NUNCA hardcodear API keys, passwords, tokens, o secrets en codigo
- SIEMPRE usar variables de entorno (process.env.NOMBRE) o secrets del CI
- Si encuentras un secret hardcoded → reemplazar con process.env.NOMBRE inmediatamente
- NUNCA loggear tokens, passwords, o datos sensibles (ni parcialmente)

## SQL y base de datos
- SIEMPRE usar Drizzle ORM para queries (nunca SQL raw sin parametros)
- Si es necesario SQL raw → SIEMPRE usar parametros preparados ($1, $2)
- NUNCA concatenar strings en queries SQL
- Validar inputs con Zod ANTES de usarlos en queries

## Autenticacion y sesiones
- JWT: NUNCA loggear el token completo (solo ultimos 8 chars si es debug)
- Passwords: SIEMPRE bcrypt con salt rounds >= 10
- TOTP/MFA: NUNCA exponer el secret en responses de API
- Refresh tokens: SIEMPRE invalidar al logout

## HTTP y API
- CORS: NUNCA usar origin: "*" en produccion
- Rate limiting: TODO endpoint publico debe tener rate limit
- Helmet: SIEMPRE activo en Express
- Validar Content-Type en endpoints que reciben body
- NUNCA confiar en headers del cliente para autorizacion (siempre verificar JWT server-side)

## Archivos y uploads
- Validar tipo MIME y tamano antes de procesar
- NUNCA construir paths con input del usuario sin sanitizar (path traversal)
- NUNCA usar eval(), new Function(), o child_process.exec() con input del usuario

## Dependencias
- No instalar dependencias sin revisar que sean mantenidas y confiables
- Preferir paquetes del ecosistema existente (MUI, Drizzle, Zod) antes que agregar nuevos
