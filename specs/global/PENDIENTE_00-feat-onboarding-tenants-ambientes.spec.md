# [PLAT-001] Onboarding Completo de Tenants y Separacion de Ambientes — Sistema Municipal

## Metadata
- **Modulos**: api-platform, packages/seeders, packages/core, api-gateway, admin-panel
- **Prioridad**: critica (prerequisito de produccion)
- **Estado**: en progreso (10/13 criterios cumplidos)
- **Fecha**: 2026-03-22
- **Origen**: Analisis de gaps post-auditoria + definicion de flujo staging → produccion

## Objetivo
Completar el sistema de onboarding automatizado de municipalidades para que, al crear un tenant
desde el admin-panel, el backend provisione end-to-end: crear DBs, migrar schemas, seed de catalogos
base, y crear usuario admin. Las suscripciones a modulos se asignan por separado desde el admin-panel
(ActivarModuloDialog, que ya funciona). Separar seeders por ambiente para que staging tenga datos
mock y produccion solo datos base.

## Flujo Operativo (como lo usaras tu)

```
TU (admin)                     admin-panel                      api-platform              PostgreSQL
─────────────────────────────────────────────────────────────────────────────────────────────────────
1. Pelarco compra             CrearTenantDialog          →  POST /admin/tenants     → CREATE DB muni_pelarco
   Llenas: nombre, slug,      (campos actuales +         →  createTenant()          → CREATE DB transversal_pelarco
   rut, adminEmail,            adminEmail, adminNombre)   →  runMigrations()         → CREATE TABLES (schemas)
   adminNombre                                            →  seedBase()              → catalogos, menus, sistemas
                                                          →  createAdminUser()       → admin@pelarco.cl + password temp
                                                          →  sendWelcomeEmail()      → email con link de activacion

2. Asignas modulos            ActivarModuloDialog (x3)   →  POST /subscriptions     → INSERT suscripciones
   contabilidad, chat,        (YA FUNCIONA ✅)
   mesa_ayuda

3. Listo — admin@pelarco.cl entra, cambia password, configura MFA, trabaja
```

## Estado Actual (lo que YA existe)

### Backend (api-platform)
| Componente | Estado | Archivo |
|---|---|---|
| `POST /api/v1/admin/tenants` | Funcional | `api-platform/src/routes/v1/admin/tenants.route.ts` |
| `createTenant()` orquestador | Funcional (parcial) | `api-platform/src/services/admin/tenants.service.ts` |
| `createTenantDatabase()` | Funcional | `api-platform/src/services/admin/provisioning.service.ts` |
| `runTenantMigrations()` | Funcional (duplicado) | `api-platform/src/services/admin/provisioning.service.ts` |
| `provisionTransversalDb()` | Funcional | `api-platform/src/services/admin/provisioning.service.ts` |
| `seedTransversalCatalogs()` | Funcional (categorias + prioridades) | `api-platform/src/services/admin/provisioning.service.ts` |
| Pool de tenants en memoria | Funcional | `packages/core/src/database/tenant-connection.ts` |
| Resolucion de tenant via JWT | Funcional | `api-gateway/src/middleware/auth.ts` |
| Resolucion de transversal DB | Funcional | `api-gateway/src/middleware/transversalDbInjector.ts` |
| Subscription guard | Parcial (solo contabilidad + chat) | `api-gateway/src/middleware/subscriptionGuard.ts` |

### Admin Panel (ya construido)
| Componente | Estado | Archivo |
|---|---|---|
| `CrearTenantDialog` | Funcional (5 campos) | `admin-panel/src/pages/components/CrearTenantDialog.tsx` |
| `EditTenantDialog` | Funcional | `admin-panel/src/pages/components/EditTenantDialog.tsx` |
| `ActivarModuloDialog` | Funcional | `admin-panel/src/pages/components/ActivarModuloDialog.tsx` |
| `CambiarEstadoSuscripcionDialog` | Funcional | `admin-panel/src/pages/components/CambiarEstadoSuscripcionDialog.tsx` |
| `TenantDetailPage` | Funcional | `admin-panel/src/pages/TenantDetailPage.tsx` |
| `TenantsPage` | Funcional | `admin-panel/src/pages/TenantsPage.tsx` |
| `useCreateTenant` hook | Funcional | `admin-panel/src/hooks/useTenants.ts` |
| Auth por API key | Funcional | `admin-panel/src/lib/auth.ts` |

## GAPs Identificados (lo que FALTA)

| # | Gap | Donde | Impacto |
|---|---|---|---|
| G1 | No se crea usuario admin del tenant | api-platform | Nadie puede hacer login en el tenant nuevo |
| G2 | No se seed datos base del tenant (sistemas, menus, perfiles, areas, catalogos) | api-platform + seeders | Tenant vacio sin navegacion ni RBAC ni plan de cuentas |
| G3 | `CrearTenantDialog` no tiene campos adminEmail ni adminNombre | admin-panel | No se puede crear usuario admin desde la UI |
| G4 | Rollback incompleto (DB queda huerfana si falla migracion) | api-platform | Recursos PostgreSQL desperdiciados |
| G5 | Runner de migraciones duplicado (provisioning vs packages/seeders) | api-platform | Dos implementaciones divergentes |
| G6 | Subscription guard no cubre configuracion ni mesa_ayuda | api-gateway | Acceso no autorizado a modulos |
| G7 | Seeders no separados por ambiente | packages/seeders | Datos mock van a produccion |
| G8 | No existe tenant demo en produccion | packages/seeders | No hay forma de hacer demos de venta |

## Alcance

### Incluye
- O1: Separar seeders por ambiente (base / development / production)
- O2: Completar `createTenant()` — agregar seed base + crear usuario admin + email de bienvenida
- O3: Agregar campos `adminEmail` y `adminNombre` al `CrearTenantDialog` del admin-panel
- O4: Parametrizar `runAllSeeders()` para aceptar dbName arbitrario (no solo muni_default)
- O5: Reutilizar `runMigrations()` de packages/seeders en provisioning (eliminar duplicado)
- O6: Mejorar rollback — DROP DATABASE si falla la migracion
- O7: Completar subscription guard (agregar configuracion y mesa_ayuda)
- O8: Crear tenant demo en produccion con script de reset

### NO incluye
- Cambiar el flujo de suscripciones (ActivarModuloDialog ya funciona — se mantiene separado)
- Facturacion / cobros automaticos
- Dominios custom por municipalidad (infraestructura DNS)
- Backup automatico por tenant
- Endpoint de estado del provisioning (fase 2 — solo si el flujo tarda >30s)

## Especificacion

### O1 — Separacion de seeders por ambiente

Reestructurar `packages/seeders/src/`:

```
seeders/src/
├── base/                          ← SIEMPRE se ejecutan (catalogos del sistema)
│   ├── identidad/
│   │   ├── seedSistemas.ts        ← sistemas del menu (contabilidad, chat, etc.)
│   │   ├── seedMenus.ts           ← arbol de menus por sistema
│   │   ├── seedPerfiles.ts        ← perfiles base (admin, usuario, auditor)
│   │   └── seedAreas.ts           ← areas base
│   ├── contabilidad/
│   │   ├── seedTiposCuentas.ts    ← catalogo de tipos (activo, pasivo, etc.)
│   │   ├── seedTitulosCuentas.ts  ← catalogo de titulos
│   │   └── seedSubgrupos.ts       ← subgrupos contables
│   ├── transversal/
│   │   ├── seedCategorias.ts      ← categorias mesa de ayuda
│   │   └── seedPrioridades.ts     ← prioridades mesa de ayuda
│   └── index.ts                   ← export seedBase(tenantDb, transversalDb)
│
├── development/                   ← SOLO en dev + staging (datos mock)
│   ├── seedUsuariosMock.ts        ← usuarios con password conocido (OK aqui)
│   ├── seedPresupuestoMock.ts     ← presupuesto de ejemplo 2026
│   ├── seedOrganigramaMock.ts     ← direcciones, departamentos, oficinas
│   ├── seedConversacionesMock.ts  ← chats de ejemplo
│   └── index.ts                   ← export seedDevelopment(tenantDb, transversalDb)
│
├── production/                    ← SOLO en produccion
│   ├── seedAdminUser.ts           ← usuario admin con password de env var
│   └── index.ts                   ← export seedProduction(tenantDb, config)
│
├── demo/                          ← SOLO para tenant demo en produccion
│   ├── seedDemoData.ts            ← datos realistas para mostrar el producto
│   └── index.ts                   ← export seedDemo(tenantDb, transversalDb)
│
├── lib/
│   └── runMigrations.ts           ← runner de migraciones (ya existe)
│
├── index.ts                       ← runner principal (modificar)
├── platform.seed.ts               ← seed de platform DB (modificar)
└── transversal.seed.ts            ← seed de transversal DB (modificar)
```

**Runner principal modificado** (`index.ts`):
```typescript
const env = process.env.NODE_ENV ?? "development";

// SIEMPRE: catalogos del sistema
await seedBase(tenantDb, transversalDb);

// Por ambiente
if (env === "production") {
  await seedProduction(tenantDb, { adminEmail: process.env.SEED_ADMIN_EMAIL });
} else {
  // dev + staging: datos mock completos
  await seedDevelopment(tenantDb, transversalDb);
}
```

**Funcion parametrizada para onboarding**:
```typescript
// Exportar para que provisioning.service.ts la use
export async function seedNewTenant(
  tenantDbName: string,
  transversalDbName: string,
  config: {
    adminEmail: string;
    adminNombre: string;
    modulosContratados: string[];
  }
) {
  const tenantPool = getTenantPool(tenantDbName, dbConfig);
  const transversalPool = getTenantPool(transversalDbName, dbConfig);

  const tenantDb = drizzle(tenantPool, { schema: tenantSchemas });
  const transversalDb = drizzle(transversalPool, { schema: transversalSchemas });

  // 1. Seed base (catalogos)
  await seedBase(tenantDb, transversalDb);

  // 2. Crear usuario admin
  const tempPassword = crypto.randomBytes(16).toString("hex");
  await seedAdminUser(tenantDb, {
    email: config.adminEmail,
    nombre: config.adminNombre,
    password: await bcrypt.hash(tempPassword, 12),
    passwordTemp: true,
  });

  return { tempPassword };
}
```

### O2 — Completar flujo de onboarding en createTenant()

Modificar `api-platform/src/services/admin/tenants.service.ts` — `createTenant()`:

**Pasos actuales** (ya funcionan):
1. ✅ INSERT en municipalidades
2. ✅ CREATE DATABASE muni_<slug>
3. ✅ RUN migraciones tenant
4. ✅ CREATE DATABASE transversal_<slug> + migraciones + seed catalogos transversal

**Agregar paso 5** — Seed base del tenant:
```typescript
// 5. Seed catalogos base en el tenant (sistemas, menus, perfiles, areas, tipos cuentas, etc.)
await seedBase(tenantDb, transversalDb);
```

**Agregar paso 6** — Crear usuario admin:
```typescript
// 6. Crear usuario admin del municipio
const tempPassword = crypto.randomBytes(16).toString("hex");
await createAdminUser(tenantDb, {
  email: input.adminEmail,          // nuevo campo requerido en el input
  nombre: input.adminNombre,        // nuevo campo requerido
  password: await bcrypt.hash(tempPassword, 12),
  passwordTemp: true,
});
```

**Agregar paso 7** — Enviar email de bienvenida:
```typescript
// 7. Enviar credenciales al admin
await sendWelcomeEmail({
  to: input.adminEmail,
  municipalidad: input.nombre,
  tempPassword,  // o mejor: link de activacion con token
});
```

**Nota**: Las suscripciones a modulos NO se crean aqui. Tu las asignas manualmente
despues desde el admin-panel con `ActivarModuloDialog` (que ya funciona).

**Input actualizado del endpoint** (agregar 2 campos):
```typescript
const createTenantSchema = z.object({
  // Campos existentes:
  nombre: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  dominioBase: z.string(),
  rut: z.string().optional(),
  maxUsuarios: z.number().int().positive().default(50),
  // NUEVOS campos:
  adminEmail: z.string().email(),
  adminNombre: z.string().min(2),
});
```

### O3 — Agregar campos al CrearTenantDialog del admin-panel

Archivo: `admin-panel/src/pages/components/CrearTenantDialog.tsx`

Agregar 2 campos al formulario, en una seccion separada "Administrador del municipio":

| Campo | Tipo | Requerido | Placeholder |
|---|---|---|---|
| Email del admin | TextField (email) | Si | `admin@pelarco.cl` |
| Nombre del admin | TextField | Si | `Juan Perez` |

Tambien agregar al tipo `CreateTenantInput` en `admin-panel/src/types/index.ts`:
```typescript
interface CreateTenantInput {
  // existentes...
  adminEmail: string;    // NUEVO
  adminNombre: string;   // NUEVO
}
```

El formulario quedaria visualmente:

```
┌─────────────────────────────────────────┐
│  Crear nueva municipalidad              │
│                                         │
│  Datos del municipio                    │
│  ┌─────────────────────────────────┐    │
│  │ Nombre *         │ Slug *       │    │
│  │ Dominio Base *   │ RUT          │    │
│  │ Max Usuarios                    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Administrador inicial                  │
│  ┌─────────────────────────────────┐    │
│  │ Email del admin *               │    │
│  │ Nombre del admin *              │    │
│  └─────────────────────────────────┘    │
│  Se enviara un email con credenciales   │
│  temporales a esta direccion.           │
│                                         │
│            [Cancelar]  [Crear]          │
└─────────────────────────────────────────┘
```

### O4 — Parametrizar runAllSeeders

Actualmente `packages/seeders/src/index.ts` lee `DB_NAME` de env (hardcoded a `muni_default`).

Modificar para aceptar un `dbName` como parametro:
```typescript
export async function runAllSeeders(
  dbName: string = process.env.DB_NAME ?? "muni_default",
  transversalDbName: string = process.env.TRANSVERSAL_DB_NAME ?? "transversal_muni_default",
) {
  // ... logica existente pero parametrizada
}
```

Esto permite que `provisioning.service.ts` llame `runAllSeeders("muni_pelarco", "transversal_pelarco")`.

### O5 — Eliminar duplicacion de runner de migraciones

`provisioning.service.ts` tiene su propia implementacion de `runTenantMigrations()` que:
1. Lee el journal JSON
2. Ejecuta cada SQL
3. Inserta en `__drizzle_migrations__`

Esto es un duplicado de `packages/seeders/src/lib/runMigrations.ts`.

**Accion**: Refactorizar `runMigrations()` de packages/seeders para ser importable:
```typescript
// packages/seeders/src/lib/runMigrations.ts
export async function runMigrations(
  pool: Pool,
  migrationsPath: string,
  schemas?: string[]
): Promise<{ applied: number; skipped: number }>
```

En `provisioning.service.ts`:
```typescript
import { runMigrations } from "@municipal/seeders/lib/runMigrations";

// En vez de implementacion propia:
await runMigrations(tenantPool, TENANT_MIGRATIONS_PATH, ["identidad", "contabilidad"]);
await runMigrations(transversalPool, TRANSVERSAL_MIGRATIONS_PATH, ["mensajeria", "mesa_ayuda"]);
```

### O6 — Mejorar rollback del provisioning

Si falla en cualquier paso posterior al CREATE DATABASE:
```typescript
try {
  await createTenantDatabase(dbName);
  await runTenantMigrations(dbName);
  await provisionTransversalDb(transversalDbName);
  await seedBase(tenantDb, transversalDb);
  await createAdminUser(...);
  await createSuscripciones(...);
} catch (error) {
  // Rollback completo
  logger.error({ error, dbName }, "Provisioning failed, rolling back");

  // 1. Cerrar pools abiertos
  await closeTenantPool(dbName);
  await closeTenantPool(transversalDbName);

  // 2. DROP databases creadas
  await dropDatabaseIfExists(dbName);
  await dropDatabaseIfExists(transversalDbName);

  // 3. Marcar tenant como fallido o eliminar registro
  await db.delete(municipalidades).where(eq(municipalidades.id, muni.id));

  throw new AppError("PROVISIONING_FAILED", `Fallo al provisionar tenant ${slug}`, 500);
}
```

### O7 — Completar subscription guard

Archivo: `api-gateway/src/middleware/subscriptionGuard.ts`

Agregar al `ROUTE_MODULE_MAP`:
```typescript
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/api/v1/contabilidad": "contabilidad",
  "/api/v1/chat": "chat",
  // AGREGAR:
  "/api/v1/configuracion": "configuracion",
  "/api/v1/mesa-ayuda": "mesa_ayuda",
};
```

### O8 — Tenant demo en produccion

Crear script `packages/seeders/src/demo/seedDemoData.ts`:
- Datos realistas de una municipalidad ficticia ("Municipalidad de Villa Demo")
- Presupuesto 2026 con datos de ejemplo
- 5 usuarios con roles distintos (alcalde, director finanzas, jefe contabilidad, operador, auditor)
- Conversaciones de chat de ejemplo
- Tickets de mesa de ayuda en distintos estados
- Plan de cuentas completo

Crear script de reset: `packages/seeders/src/demo/resetDemo.ts`:
```typescript
export async function resetDemoTenant() {
  const pool = getTenantPool("muni_demo", config);
  // Truncate all tables in order (respetando FKs)
  // Re-seed con datos demo frescos
  await seedBase(tenantDb, transversalDb);
  await seedDemoData(tenantDb, transversalDb);
}
```

Agregar npm script: `"demo:reset": "tsx src/demo/resetDemo.ts"`

**Opcion Railway**: cron job semanal que ejecuta el reset (o endpoint admin protegido).

## Flujo Completo por Ambiente

### Local (desarrollo)
```bash
make dev
# 1. Docker crea muni_default, platform, transversal, transversal_muni_default
# 2. Migraciones en las 3 DBs
# 3. platform.seed.ts → municipalidad default + 4 modulos + suscripciones
# 4. seedBase() → catalogos del sistema en muni_default
# 5. seedDevelopment() → usuarios mock, presupuesto ejemplo, organigrama
```

### Staging (Railway — develop branch)
```bash
# Deploy automatico al mergear a develop
# 1. Las DBs ya existen en Railway (persistentes)
# 2. Migraciones se ejecutan automaticamente
# 3. Si es primer deploy: platform.seed.ts + seedBase + seedDevelopment
# 4. Si no es primer deploy: migraciones incrementales
# NODE_ENV=staging → seeders de development activos
```

### Produccion (Railway — main branch)
```bash
# Deploy automatico al mergear a main
# 1. Primera vez: platform.seed.ts → modulos base
# 2. Primera vez: crear tenant demo (muni_demo) via endpoint admin o script
# 3. seedBase() + seedDemoData() en muni_demo
# 4. Cada nuevo cliente: POST /api/v1/admin/tenants con datos del municipio
# NODE_ENV=production → NO se ejecutan seeders de development
```

### Cuando "Pelarco compra"
```
TU en admin-panel:

1. TenantsPage → boton "Crear" → CrearTenantDialog:
   {
     nombre: "Municipalidad de Pelarco",
     slug: "pelarco",
     dominioBase: "pelarco.municipal.app",
     rut: "69.070.500-0",
     adminEmail: "admin@pelarco.cl",      ← NUEVO campo
     adminNombre: "Juan Perez"            ← NUEVO campo
   }
   → Backend crea DBs, migra, seed base, crea admin, envia email
   → El dialog muestra "Municipalidad creada exitosamente"

2. TenantDetailPage → ActivarModuloDialog (x3):
   → Activas contabilidad, chat, mesa_ayuda
   → (Esto YA funciona hoy)

3. admin@pelarco.cl recibe email, entra, cambia password, configura MFA, trabaja
```

## Criterios de Aceptacion
- [x] O1: `packages/seeders/src/base/` existe con catalogos separados de datos mock
- [x] O1: `NODE_ENV=production pnpm seed` NO inserta usuarios mock ni presupuestos de ejemplo
- [x] O1: `NODE_ENV=development pnpm seed` inserta datos mock completos (comportamiento actual)
- [x] O2: `POST /admin/tenants` con `adminEmail` + `adminNombre` crea tenant funcional end-to-end
- [ ] O2: El usuario admin puede hacer login inmediatamente despues del onboarding (previa asignacion de modulos)
- [x] O3: `CrearTenantDialog` tiene campos Email y Nombre del admin, los envia en el POST
- [x] O4: `runAllSeeders("muni_pelarco", "transversal_pelarco")` funciona sin modificar env vars
- [x] O5: `provisioning.service.ts` no tiene su propia implementacion de migraciones — usa la de packages/seeders
- [x] O6: Si falla el provisioning, no quedan DBs huerfanas en PostgreSQL
- [x] O7: Subscription guard bloquea acceso a configuracion y mesa_ayuda sin suscripcion
- [ ] O8: Tenant `muni_demo` existe en produccion con datos realistas para demos de venta
- [ ] O8: Script `pnpm demo:reset` limpia y regenera datos del tenant demo
- [x] El flujo completo (crear tenant + seed) tarda < 30 segundos

## Restricciones
- Las suscripciones se manejan por separado via ActivarModuloDialog (NO automatizar en createTenant)
- Los seeders base deben ser 100% idempotentes (`onConflictDoNothing`)
- El provisioning debe ser atomico: o se completa todo o se revierte todo
- El password temporal NO se loguea (ni siquiera parcialmente)
- El email de bienvenida debe usar el servicio de email existente (Resend)
- No se deben crear DBs con nombres que contengan caracteres especiales (solo `[a-z0-9_]`)
- El tenant demo NUNCA debe poder ser eliminado accidentalmente (flag `isDemo: true` o proteccion en el endpoint)

## Notas
- Orden de implementacion: O1 → O5 → O4 → O7 → O2 → O3 → O6 → O8
- O1 es el prerequisito fundamental — todo lo demas depende de tener seeders separados
- O2 + O3 son el corazon del spec — el onboarding end-to-end desde admin-panel
- O8 (tenant demo) puede hacerse manualmente al principio: tu creas el tenant demo
  desde admin-panel y luego ejecutas el script de datos demo
- Este spec debe implementarse ANTES de los specs 01-07 porque define como se gestionan los ambientes
