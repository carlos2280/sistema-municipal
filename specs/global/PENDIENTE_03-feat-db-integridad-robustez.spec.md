# [DB-001] Integridad y Robustez de la Capa de Datos — Auditoria 2026-03-22

## Metadata
- **Modulos**: packages/db-*, packages/seeders, api-identidad, api-contabilidad, api-platform
- **Prioridad**: alta
- **Estado**: completado
- **Fecha**: 2026-03-22
- **Origen**: Auditoria automatizada — reporte 01-db-audit.md

## Objetivo
Corregir defectos estructurales en la capa de datos que comprometen la integridad referencial, la auditabilidad y la robustez del sistema. Incluye soft deletes, triggers de updatedAt, enums PostgreSQL, indices faltantes, y normalizacion de tablas.

## Alcance

### Incluye
- D1: Implementar soft delete en usuarios, planes de cuentas y centros de costo
- D2: Crear trigger PostgreSQL generico para `updated_at` y aplicarlo a todas las tablas
- D3: Convertir campos de estado `text` a `pgEnum` (tickets, llamadas, mensajes, suscripciones, participantes)
- D4: Agregar indices faltantes en FKs usadas en JOINs
- D5: Reemplazar `llamadas.participantesIds` text por tabla relacional `llamada_participantes`
- D6: Agregar unique constraints faltantes (`tiposCuentas.codigo`, `titulosCuentas.codigo`)
- D7: Hacer `platform.seed.ts` idempotente
- D8: Agregar timestamps faltantes a tablas sin ellos
- D9: Agregar relaciones Drizzle faltantes (menus, oficinas, departamentos, direcciones)
- D10: Eliminar SELECT * en rutas criticas (login, getAllUsuarios)

### NO incluye
- Migraciones reversibles (requiere evaluacion de drizzle-kit — spec separado)
- Cambios en pool size (configuracion operacional, no schema)
- `process.exit(-1)` en error handler del pool (fix menor operacional)

## Especificacion

### D1 — Soft delete en entidades criticas
**Tablas afectadas**: `identidad.usuarios`, `contabilidad.planesCuentas`, `contabilidad.centrosCosto`, `identidad.menus`, `identidad.sistemas`

**Cambios por tabla**:
1. Agregar columna `deleted_at timestamp null default null`
2. Agregar columna `deleted_by integer null` (referencia al usuario que elimino)
3. Crear indice parcial: `CREATE INDEX idx_<tabla>_active ON <tabla>(id) WHERE deleted_at IS NULL`
4. Modificar todos los services de listado para filtrar `WHERE deleted_at IS NULL`
5. Modificar los services de eliminacion: en vez de `db.delete()`, hacer `db.update().set({ deletedAt: new Date(), deletedBy: userId })`

**Drizzle schema**:
```typescript
deletedAt: timestamp("deleted_at"),
deletedBy: integer("deleted_by"),
```

### D2 — Trigger de updated_at automatico
**Migracion SQL**:
```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Aplicar a TODAS las tablas que tienen columna `updated_at`:
- identidad: usuarios, areas, perfiles, sistemas, menus
- contabilidad: tiposCuentas, titulosCuentas, cuentasSubgrupos, planesCuentas, centrosCosto, subprogramasPresupuestarios, presupuestos, presupuestosDetalle
- mensajeria: conversaciones, participantes, mensajes, reuniones
- mesa_ayuda: tickets, comentarios, categorias, prioridades
- platform: municipalidades, modulos, suscripciones

```sql
CREATE TRIGGER trg_<tabla>_updated_at
  BEFORE UPDATE ON <schema>.<tabla>
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### D3 — Convertir text a pgEnum

| Tabla | Campo | Valores |
|---|---|---|
| mesa_ayuda.tickets | estado | abierto, en_progreso, en_espera, resuelto, cerrado |
| mensajeria.llamadas | estado | iniciada, en_curso, finalizada, perdida |
| mensajeria.mensajes | tipo | texto, archivo, sistema, llamada, reunion |
| mensajeria.conversaciones | tipo | directa, grupal, departamento, canal |
| mensajeria.participantes | rol | admin, miembro, observador |
| platform.suscripciones | estado | activa, suspendida, cancelada, trial |
| platform.municipalidades | mfaPolicy | disabled, optional, required |
| mensajeria.invitacionesReunion | estado | pendiente, aceptada, rechazada |
| mensajeria.estadoUsuarios | estado | online, offline, ausente, ocupado |

**Procedimiento por cada conversion**:
1. Crear el `pgEnum` en Drizzle schema
2. Generar migracion con `ALTER TABLE ... ALTER COLUMN ... TYPE <enum> USING <columna>::<enum>`
3. Actualizar `$type<>` en el schema Drizzle para que coincida con el enum
4. Verificar que los seeders usen solo valores validos

### D4 — Indices faltantes

| Tabla | Columna | Tipo de indice | Justificacion |
|---|---|---|---|
| contabilidad.cuentasSubgrupos | tipo_cuenta_id | btree | FK sin indice, 200+ rows, JOIN frecuente |
| mensajeria.conversaciones | departamento_id | btree | Queries cross-schema por departamento |
| mensajeria.mensajes | reply_to_id | btree | Queries de hilos de conversacion |
| mensajeria.mensajes | remitente_id | btree | Queries de mensajes por usuario |
| mensajeria.participantes | usuario_id | btree | Queries cross-schema por usuario |

### D5 — Tabla relacional para participantes de llamada
**Eliminar**: `llamadas.participantesIds` (text)
**Crear tabla**:
```typescript
export const llamadaParticipantes = pgTable("llamada_participantes", {
  id: serial("id").primaryKey(),
  llamadaId: integer("llamada_id").notNull().references(() => llamadas.id, { onDelete: "cascade" }),
  usuarioId: integer("usuario_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
}, (table) => [
  index("idx_llamada_part_llamada").on(table.llamadaId),
  index("idx_llamada_part_usuario").on(table.usuarioId),
  unique("uq_llamada_participante").on(table.llamadaId, table.usuarioId),
]);
```

### D6 — Unique constraints faltantes
- `contabilidad.tipos_cuentas`: `UNIQUE(codigo)`
- `contabilidad.titulos_cuentas`: `UNIQUE(codigo)`

### D7 — Idempotencia de platform.seed.ts
Agregar `onConflictDoNothing({ target: municipalidades.slug })` y equivalente para modulos y suscripciones.

### D8 — Timestamps faltantes
Agregar `createdAt` y `updatedAt` a:
- `identidad.oficinas`
- `identidad.departamentos`
- `identidad.direcciones`
- `mensajeria.estadoUsuarios` (al menos `updatedAt`)
- `mensajeria.llamadas` (agregar `updatedAt`)
- `mensajeria.archivos` (agregar `updatedAt`)
- `mesa_ayuda.adjuntos` (agregar `updatedAt`)

### D9 — Relaciones Drizzle faltantes
Crear en `packages/db-identidad/src/relations/`:
- `menus.relations.ts` — relacion con sistemas (padre) y auto-referencia (menuPadre)
- `oficinas.relations.ts` — relacion con departamentos
- `departamentos.relations.ts` — relacion con direcciones y oficinas
- `direcciones.relations.ts` — relacion con departamentos

### D10 — Eliminar SELECT * en rutas criticas
**Archivos**:
- `api-autorizacion/src/services/autorizacion.service.ts:95-98` — login: seleccionar solo campos necesarios (id, email, password, mfaEnabled, mfaSecret, activo)
- `api-identidad/src/services/usuarios.service.ts:14` — getAllUsuarios: excluir password, mfaSecret, mfaBackupCodes

## Criterios de Aceptacion
- [x] D1: `db.delete(usuarios)` no existe en ningun service — reemplazado por soft delete
- [x] D2: Trigger `set_updated_at` existe en la DB y se ejecuta automaticamente en UPDATE
- [x] D3: `\dT+` en psql muestra los enums creados. Ningun campo de estado acepta strings arbitrarios
- [x] D4: `\di` muestra los nuevos indices en las tablas afectadas
- [x] D5: Tabla `llamada_participantes` existe. Campo `participantesIds` eliminado de `llamadas`
- [x] D6: `\d contabilidad.tipos_cuentas` muestra constraint UNIQUE en `codigo`
- [x] D7: `pnpm platform:seed` ejecutado 2 veces consecutivas sin error
- [x] D8: Todas las tablas listadas tienen `created_at` y `updated_at`
- [x] D9: `db.query.menus.findFirst({ with: { sistema: true, menuPadre: true } })` funciona
- [x] D10: Login query no trae `mfaBackupCodes` ni `mfaSecret` completo al proceso

## Restricciones
- Las migraciones deben ser compatibles con datos existentes (ALTER TABLE ADD COLUMN con DEFAULT)
- Los enums (D3) requieren que los datos existentes solo contengan valores validos — verificar antes de migrar
- D5 requiere migrar datos existentes de text a tabla relacional antes de eliminar la columna
- Ejecutar en ambiente de staging antes de produccion

## Notas
- Orden de implementacion sugerido: D7 → D8 → D2 → D4 → D6 → D3 → D9 → D10 → D1 → D5
- D7 es el fix mas seguro (solo seeders)
- D5 es el mas complejo (requiere migracion de datos + cambios en api-chat)
- Generar migraciones con `pnpm drizzle-kit generate` despues de cada cambio de schema
