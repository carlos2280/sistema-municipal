# [FEAT-MULTI-TENANT-TRANSVERSAL] Multi-Tenant con Aislamiento por DB Transversal

## Metadata
- **Módulos**: api-chat, api-mesa-ayuda, api-gateway, api-platform, packages/seeders, packages/core
- **Prioridad**: alta
- **Estado**: borrador
- **Fecha**: 2026-03-22
- **Depende de**: feat-db-transversal-separation (completado)

## Objetivo

Implementar multi-tenant con aislamiento total por DB transversal. Cada municipalidad tendrá su propia base de datos transversal (`transversal_<slug>`) con sus schemas `mensajeria` y `mesa_ayuda`. Esto garantiza que los datos de una municipalidad nunca se mezclen con los de otra.

## Contexto

### Estado actual (post feat-db-transversal-separation)

```
muni_default/          ← CORE (compartido por todos los tenants)
├── identidad          ← usuarios, roles, areas (tiene tenantId)
├── contabilidad       ← plan de cuentas, presupuestos

transversal/           ← UNA sola DB para TODOS los tenants
├── mensajeria         ← chat (SIN tenantId — no distingue municipalidad)
├── mesa_ayuda         ← tickets (tiene tenantId — pero comparte tablas)

platform/              ← Gestión SaaS
├── public             ← modulos, municipalidades, suscripciones
```

### Problemas

1. **Mensajería sin tenantId**: las tablas de `mensajeria` no tienen campo `tenantId`. Con múltiples municipalidades, un usuario de Santiago podría ver conversaciones de Valparaíso.
2. **Mesa de ayuda comparte tablas**: `tickets` tiene `tenantId` pero los datos de todas las municipalidades están en la misma DB. Un bug de filtro podría exponer datos cruzados.
3. **Sin aislamiento real**: una municipalidad problemática (muchos datos, queries lentas) afecta a todas las demás.
4. **Imposible escalar independientemente**: no se puede mover una municipalidad a otro servidor sin mover todas.

### Arquitectura objetivo

Dos estrategias según la naturaleza del servicio:

- **Mensajería (chat)**: datos privados entre personas → **aislamiento por DB** (una DB por municipalidad)
- **Mesa de ayuda**: el proveedor CRISCAR gestiona todos los tickets centralizadamente → **centralizado con `tenantId`** (una sola DB, filtro por municipalidad)

```
muni_default/                      ← CORE (compartido, multi-tenant por tenantId)
├── identidad
├── contabilidad

transversal_santiago/              ← Chat aislado de Santiago
├── mensajeria

transversal_valparaiso/            ← Chat aislado de Valparaíso
├── mensajeria

transversal/                       ← Mesa de ayuda CENTRALIZADA (todos los tenants)
├── mesa_ayuda                     ← tickets con tenantId (gestión unificada)

platform/                          ← Gestión SaaS (tabla de mapeo tenant → DB)
├── public
│   └── municipalidades            ← agrega campo transversal_db_name (para chat)
```

**¿Por qué centralizar mesa de ayuda?**
- CRISCAR necesita dashboard global de todos los tickets
- SLA monitoring cross-tenant desde un solo lugar
- Asignación de tickets entre municipalidades
- Reportes consolidados sin iterar sobre múltiples DBs

## Alcance

### Incluye
- Agregar campo `transversal_db_name` a tabla `platform.municipalidades`
- Crear script/seeder que genera la DB transversal de un tenant nuevo
- Actualizar `api-gateway` para inyectar header `x-transversal-db-name` con el nombre de la DB transversal del tenant
- Actualizar `api-chat` para usar `createTenantDbClient(transversalDbName)` dinámicamente
- Actualizar `api-mesa-ayuda` para conectar a la DB transversal del tenant
- Eliminar `tenantId` de `mesa_ayuda.tickets` (ya no es necesario — el aislamiento es por DB)
- Actualizar `api-platform` (admin panel) para queries cross-tenant (iterar sobre DBs de cada tenant)
- Actualizar Docker init scripts para crear DBs transversales por tenant en desarrollo
- Actualizar seeders para crear datos demo en cada DB transversal

### NO incluye
- Migración de datos de producción (es MVP)
- Panel de auto-registro de municipalidades (se hace manual desde admin)
- Multi-tenant en `muni_default` (identidad/contabilidad ya usan `tenantId`, ese patrón no cambia)
- Sharding o replicación de DBs transversales

## Especificación

### 1. Tabla `municipalidades` — Nuevo campo

```sql
ALTER TABLE platform.municipalidades
ADD COLUMN transversal_db_name TEXT NOT NULL DEFAULT 'transversal';
```

Ejemplo de datos:
| id | slug | nombre | transversal_db_name |
|----|------|--------|---------------------|
| 1 | santiago | Municipalidad de Santiago | transversal_santiago |
| 2 | valparaiso | Municipalidad de Valparaíso | transversal_valparaiso |

### 2. Flujo de creación de tenant

Cuando se registra una nueva municipalidad desde el admin panel:

1. Insertar registro en `platform.municipalidades` con `transversal_db_name = transversal_<slug>`
2. Crear DB `transversal_<slug>` en PostgreSQL
3. Crear schemas `mensajeria` y `mesa_ayuda` en la nueva DB
4. Ejecutar migraciones de transversal en la nueva DB
5. Seedear catálogos (categorías, prioridades) en la nueva DB

Este flujo se implementará como un endpoint en `api-platform`:
```
POST /api/v1/platform/admin/tenants
Body: { slug, nombre, ... }
→ Crea municipalidad + DB transversal + migraciones + seeds
```

### 3. api-gateway — Inyección de header

El gateway ya inyecta `x-tenant-db-name` (DB de identidad). Agregar `x-transversal-db-name`:

```typescript
// En el proxy, tras autenticar:
const tenant = await getMunicipalidad(user.tenantId); // query a platform DB
proxyReq.setHeader('x-transversal-db-name', tenant.transversal_db_name);
```

Para servicios transversales (`api-chat`, `api-mesa-ayuda`), este header indica qué DB usar.

### 4. api-chat — Conexión dinámica por tenant

```typescript
// middleware/tenantDb.ts
const transversalDbName = req.headers['x-transversal-db-name'] as string;
if (transversalDbName) {
  req.tenantDb = createTenantDbClient(transversalDbName);
}
// Si no hay header, usa la DB transversal por defecto (dev/backward compat)
```

`createTenantDbClient` ya existe y usa `getTenantPool` de `@municipal/core` para reutilizar pools.

### 5. api-mesa-ayuda — SIN cambio de conexión

Mesa de ayuda **permanece centralizada** en la DB `transversal` (compartida). NO se separa por tenant.

- `tickets.tenantId` sigue identificando la municipalidad de origen
- El admin panel sigue consultando una sola DB para todos los tickets
- `api-mesa-ayuda` sigue conectando a `transversal` (no necesita `x-transversal-db-name`)

### 6. api-platform (admin panel) — Queries cross-tenant

El admin panel necesita ver datos de TODAS las municipalidades. Dos opciones:

**Opción A — Iterar sobre DBs**: para cada municipalidad, conectar a su DB transversal y ejecutar la query. Combinar resultados en código.

**Opción B — Foreign Data Wrapper (FDW)**: crear tablas foráneas en platform que apuntan a las tablas de cada DB transversal. Más eficiente para queries de reporting.

**Recomendación**: empezar con Opción A (más simple, menos infraestructura). Migrar a FDW solo si el rendimiento lo requiere.

### 7. Docker Compose — Desarrollo

Para desarrollo, crear DBs transversales del tenant demo:

```bash
# init-scripts/02-create-databases.sh
CREATE DATABASE transversal_muni_default;  # tenant demo
# Crear schemas mensajeria y mesa_ayuda en la nueva DB
```

### 8. Seeders

```
packages/seeders/src/
├── transversal.seed.ts           ← Recibe dbName como parámetro
│                                    Crea schemas + migra + seedea catálogos
├── platform.seed.ts              ← Inserta municipalidades con transversal_db_name
```

Script: `pnpm transversal:seed -- --db=transversal_muni_default`

### 9. Socket.IO (api-chat)

El socket de chat debe conectar a la DB transversal correcta. El handshake ya recibe el JWT con `tenantId`. Usar ese ID para resolver `transversal_db_name` desde platform y crear el pool.

## Diagrama de Conexiones

```
                    ┌───────────┐
                    │  Gateway  │
                    │ (auth+proxy)│
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         ┌─────────┐ ┌─────────┐ ┌──────────┐
         │api-chat  │ │api-mesa │ │api-ident │
         │          │ │-ayuda   │ │          │
         └────┬─────┘ └────┬────┘ └────┬─────┘
              │            │           │
              │ (dinámico)  │ (fijo)    │ (fijo)
              ▼            ▼           ▼
┌────────────────┐  ┌──────────┐  ┌──────────┐
│transversal_    │  │transversal│  │muni_     │
│santiago        │  │(central) │  │default   │
│ └─mensajeria   │  │ └─mesa_  │  │ ├─ident. │
│                │  │   ayuda  │  │ └─contab.│
│transversal_    │  │          │  │          │
│valparaiso      │  │ tenantId │  │          │
│ └─mensajeria   │  │ filtra   │  │          │
└────────────────┘  └──────────┘  └──────────┘
   DB por tenant     1 sola DB      1 sola DB
   (aislamiento)    (centralizado)
```

## Criterios de Aceptación

- [ ] Campo `transversal_db_name` en `platform.municipalidades`
- [ ] Endpoint de creación de tenant que genera la DB transversal automáticamente
- [ ] `api-gateway` inyecta `x-transversal-db-name` en headers del proxy
- [ ] `api-chat` conecta dinámicamente a la DB transversal del tenant
- [ ] `api-mesa-ayuda` conecta dinámicamente a la DB transversal del tenant
- [ ] Datos de un tenant NO son accesibles desde otro tenant
- [ ] Admin panel puede consultar datos de todos los tenants (cross-tenant)
- [ ] Docker Compose crea DB transversal del tenant demo al arrancar
- [ ] Seeders parametrizables por tenant
- [ ] Socket.IO de chat conecta a la DB transversal correcta

## Restricciones

- NO cambiar contratos de API (rutas, payloads, responses)
- NO cambiar componentes frontend
- NO usar FK constraints cross-database
- Máximo de pools abiertos por proceso configurable (evitar memory leaks)
- Limpieza de pools inactivos después de N minutos
- `getTenantPool` de `@municipal/core` debe manejar el ciclo de vida de los pools

## Orden de Implementación

1. Agregar `transversal_db_name` a `municipalidades` + migración
2. Actualizar `api-gateway` para inyectar header
3. Actualizar `api-chat` middleware de tenant
4. Actualizar `api-mesa-ayuda` middleware de tenant
5. Crear endpoint de provisioning de tenant en `api-platform`
6. Actualizar seeders
7. Actualizar Docker init scripts
8. Actualizar admin panel (queries cross-tenant)
9. Testing end-to-end con 2+ tenants

## Notas

### Alternativas descartadas

1. **tenantId en cada tabla** (filtro por columna): descartado porque no ofrece aislamiento real. Un bug de filtro expone datos cruzados. Para servicios sensibles como mensajería (chat privado), el aislamiento por DB es más seguro.

2. **Schema por tenant** (misma DB, distinto schema): descartado porque PostgreSQL no permite búsquedas cross-schema eficientes para el admin panel, y el aislamiento es parcial (mismos recursos de DB).

3. **Una DB por servicio por tenant** (`chat_santiago`, `mesa_santiago`): descartado por complejidad excesiva. Una DB transversal por tenant es suficiente.

### Consideraciones de rendimiento

- Cada tenant agrega un pool de conexiones (~5 conexiones por defecto)
- Con 50 municipalidades: ~250 conexiones activas por proceso
- Implementar cleanup de pools inactivos (cerrar después de 30 min sin uso)
- `getTenantPool` de `@municipal/core` ya reutiliza pools — solo falta agregar TTL

### Compatibilidad con feat-db-transversal-separation

Este spec es la evolución natural de la separación de DB transversal. La DB `transversal` actual se renombra a `transversal_muni_default` (o se mantiene como default para backward compat) y se crean nuevas DBs por tenant.
