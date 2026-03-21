---
name: owasp-security
description: Estandares de seguridad OWASP Top 10 y ASVS. Aplicar cuando se implementen endpoints de autenticacion, autorizacion, validacion de inputs, manejo de JWT, control de acceso RBAC, o cualquier funcionalidad con implicaciones de seguridad.
context: fork
allowed-tools: [Read, Grep, Glob]
---

# OWASP - Seguridad en Aplicaciones Web

Convenciones de seguridad basadas en OWASP Top 10 (2021) y OWASP ASVS.

## A01: Broken Access Control

- Denegar por defecto: todo recurso requiere autenticacion a menos que sea explicitamente publico
- Verificar autorizacion en el servidor, nunca confiar en el cliente
- Usar middleware/policies para control de acceso, no logica dispersa en controllers
- No exponer IDs secuenciales en URLs, preferir UUIDs
- Validar que el usuario tiene permisos sobre el recurso especifico (no solo sobre el tipo)

## A02: Cryptographic Failures

- HTTPS siempre en produccion
- Passwords: `bcrypt` o `argon2`, nunca MD5/SHA1/SHA256 directo
- Tokens/secrets en variables de entorno, nunca en codigo o logs
- Cookies sensibles: `Secure`, `HttpOnly`, `SameSite=Strict`

## A03: Injection

- **SQL**: Prepared statements / Drizzle ORM, nunca concatenar
- **XSS**: React JSX auto-escapa. NUNCA usar `dangerouslySetInnerHTML` con input del usuario
- **Command Injection**: Nunca pasar input del usuario a `exec()`, `child_process.exec()`

## A04: Insecure Design

- Validar en el servidor siempre. La validacion del cliente es UX, no seguridad
- Rate limiting en endpoints sensibles (login, registro, reset password)
- Limites de tamano en uploads y payloads
- Timeouts en operaciones externas (DB, APIs, archivos)

## A05: Security Misconfiguration

- No exponer stack traces en produccion
- Headers de seguridad: Helmet los configura automaticamente
- CORS: origins explicitos, nunca `*` con credenciales
- Deshabilitar `X-Powered-By`

## A06: Vulnerable Components

- Mantener dependencias actualizadas (`pnpm audit`)
- Lockfiles (`pnpm-lock.yaml`) en el repo
- No instalar paquetes sin verificar mantenimiento y popularidad

## A07: Authentication Failures

- Mensajes genericos en login fallido: "Credenciales invalidas"
- Bloqueo temporal tras N intentos fallidos
- JWT: expiracion corta, refresh tokens con rotacion
- Logout: invalidar token del lado del servidor

## A08-A10: Data Integrity, Logging, SSRF

- Verificar integridad de datos criticos
- Loguear: login fallidos, cambios de permisos, errores 500
- No loguear: passwords, tokens, datos personales
- Validar URLs del usuario, bloquear IPs internas

## Validacion de Input

| Dato | Validacion |
|------|-----------|
| Email | Formato + longitud maxima |
| Password | Minimo 8 chars, maximo 128 |
| Texto libre | Longitud maxima, sanitizar HTML |
| Numeros | Rango valido, tipo correcto |
| Archivos | Tipo MIME, extension, tamano maximo |
| IDs | UUID format |

## Tarea: $ARGUMENTS

Analiza lo solicitado desde la perspectiva de seguridad OWASP.
