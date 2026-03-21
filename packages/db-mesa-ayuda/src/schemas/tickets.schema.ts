import { sql } from "drizzle-orm";
import {
  index,
  integer,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { mesaAyudaSchema } from "../schemas";
import { categorias } from "./categorias.schema";
import { prioridades } from "./prioridades.schema";

export const tickets = mesaAyudaSchema.table(
  "tickets",
  {
    id: serial("id").primaryKey(),
    // FK a public.municipalidades — no se usa referencia directa para evitar
    // dependencia cross-schema entre db-mesa-ayuda y db-platform en tiempo de build.
    // El constraint FK se define en la migración SQL.
    tenantId: integer("tenant_id").notNull(),
    numero: text("numero").notNull(),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion").notNull(),
    estado: text("estado").notNull().default("abierto"),
    categoriaId: integer("categoria_id")
      .notNull()
      .references(() => categorias.id),
    prioridadId: integer("prioridad_id")
      .notNull()
      .references(() => prioridades.id),
    solicitanteId: integer("solicitante_id").notNull(),
    solicitanteNombre: text("solicitante_nombre").notNull(),
    solicitanteEmail: text("solicitante_email"),
    asignadoId: integer("asignado_id"),
    asignadoNombre: text("asignado_nombre"),
    departamento: text("departamento"),
    fechaLimite: timestamp("fecha_limite", { withTimezone: true }),
    fechaResolucion: timestamp("fecha_resolucion", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("idx_tickets_tenant").on(table.tenantId),
    tenantEstadoIdx: index("idx_tickets_tenant_estado").on(
      table.tenantId,
      table.estado,
    ),
    uqTenantNumero: unique("uq_tickets_tenant_numero").on(
      table.tenantId,
      table.numero,
    ),
    categoriaIdx: index("idx_tickets_categoria").on(table.categoriaId),
    prioridadIdx: index("idx_tickets_prioridad").on(table.prioridadId),
    solicitanteIdx: index("idx_tickets_solicitante").on(
      table.tenantId,
      table.solicitanteId,
    ),
    asignadoIdx: index("idx_tickets_asignado").on(
      table.tenantId,
      table.asignadoId,
    ),
    createdIdx: index("idx_tickets_created").on(table.createdAt),
    fechaLimiteIdx: index("idx_tickets_fecha_limite")
      .on(table.fechaLimite)
      .where(
        sql`${table.estado} NOT IN ('resuelto', 'cerrado')`,
      ),
  }),
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketUpdate = Partial<NewTicket>;
