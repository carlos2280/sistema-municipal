import { db } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import type {
  AgregarComentarioInput,
  AsignarTicketInput,
  CambiarCategoriaInput,
  CambiarEstadoInput,
  CambiarPrioridadInput,
  CreateCategoriaInput,
  EstadoTicket,
  TicketFilters,
  UpdateCategoriaInput,
  UpdatePrioridadInput,
} from "@/libs/schemas/mesaAyuda.schemas";
import {
  categorias,
  comentarios,
  historialEstados,
  prioridades,
  tickets,
} from "@municipal/db-mesa-ayuda";
import { municipalidades } from "@municipal/db-platform";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  lt,
  notInArray,
  sql,
} from "drizzle-orm";

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface DashboardData {
  totalTickets: number;
  abiertos: number;
  enProgreso: number;
  enEspera: number;
  vencidosSla: number;
  slaCompliance: number;
  tiempoPromedioHoras: number;
  tendencia30Dias: TendenciaDia[];
  porMunicipalidad: MunicipalidadResumen[];
  porCategoria: CategoriaResumen[];
  porPrioridad: PrioridadResumen[];
}

interface TendenciaDia {
  fecha: string;
  creados: number;
  resueltos: number;
}

interface MunicipalidadResumen {
  tenantSlug: string;
  nombre: string;
  totalTickets: number;
  abiertos: number;
  slaCompliance: number;
}

interface CategoriaResumen {
  categoria: string;
  cantidad: number;
}

interface PrioridadResumen {
  prioridad: string;
  cantidad: number;
}

export interface TicketListItem {
  id: number;
  numero: string;
  tenantId: number;
  tenantSlug: string;
  tenantNombre: string;
  titulo: string;
  estado: string;
  prioridadId: number;
  prioridadNombre: string;
  prioridadColor: string;
  prioridadCodigo: string;
  categoriaId: number;
  categoriaNombre: string;
  categoriaColor: string;
  solicitante: string;
  asignado: string | null;
  slaVencido: boolean;
  fechaLimite: string | null;
  createdAt: string;
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComentarioDetalle {
  id: number;
  autorNombre: string;
  contenido: string;
  esInterno: boolean;
  createdAt: string;
}

export interface HistorialDetalle {
  id: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivo: string | null;
  ejecutadoPor: number;
  createdAt: string;
}

export interface TicketDetail {
  id: number;
  numero: string;
  tenantId: number;
  tenantSlug: string;
  tenantNombre: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridadId: number;
  prioridadNombre: string;
  prioridadColor: string;
  prioridadCodigo: string;
  categoriaId: number;
  categoriaNombre: string;
  categoriaColor: string;
  solicitante: string;
  emailSolicitante: string | null;
  asignado: string | null;
  slaVencido: boolean;
  fechaLimite: string | null;
  fechaResolucion: string | null;
  createdAt: string;
  updatedAt: string;
  comentarios: ComentarioDetalle[];
  historial: HistorialDetalle[];
}

export interface TenantResumen {
  tenantId: number;
  tenantSlug: string;
  nombre: string;
  totalTickets: number;
  abiertos: number;
  enProgreso: number;
  resueltos: number;
  slaCompliance: number;
  activo: boolean | null;
}

export interface SlaMonitoreo {
  vencidos: number;
  enRiesgo: number;
  compliancePorPrioridad: CompliancePrioridad[];
  compliancePorTenant: ComplianceTenant[];
}

interface CompliancePrioridad {
  prioridadId: number;
  prioridadNombre: string;
  total: number;
  vencidos: number;
  compliance: number;
}

interface ComplianceTenant {
  tenantId: number;
  tenantSlug: string;
  nombre: string;
  total: number;
  vencidos: number;
  compliance: number;
}

// ─── Constantes de transición de estados ──────────────────────────────────────

const TRANSICIONES_VALIDAS: Record<EstadoTicket, EstadoTicket[]> = {
  abierto: ["en_progreso", "en_espera", "cerrado"],
  en_progreso: ["en_espera", "resuelto", "cerrado"],
  en_espera: ["en_progreso", "resuelto", "cerrado"],
  resuelto: ["cerrado", "en_progreso"],
  cerrado: [],
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (): Promise<DashboardData> => {
  const estadosAbiertos = ["abierto", "en_progreso", "en_espera"];

  const [
    statsByEstado,
    vencidosResult,
    totalResult,
    tiempoPromedioResult,
    tendenciaResult,
    porMunicipalidadResult,
    porCategoriaResult,
    porPrioridadResult,
  ] = await Promise.all([
    db
      .select({
        estado: tickets.estado,
        cantidad: count(),
      })
      .from(tickets)
      .groupBy(tickets.estado),

    db
      .select({ cantidad: count() })
      .from(tickets)
      .where(
        and(
          lt(tickets.fechaLimite, sql`now()`),
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    db.select({ cantidad: count() }).from(tickets),

    db
      .select({
        promedioHoras: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (fecha_resolucion - created_at)) / 3600
            )::numeric(10,2),
            0
          )
        `.as("promedioHoras"),
      })
      .from(tickets)
      .where(eq(tickets.estado, "resuelto")),

    db
      .select({
        fecha: sql<string>`DATE(created_at)::text`.as("fecha"),
        creados: count(),
        resueltos: sql<number>`
          COUNT(*) FILTER (WHERE estado = 'resuelto')::int
        `.as("resueltos"),
      })
      .from(tickets)
      .where(sql`created_at >= now() - interval '30 days'`)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`),

    db
      .select({
        tenantId: tickets.tenantId,
        tenantSlug: municipalidades.slug,
        nombre: municipalidades.nombre,
        total: count(),
        abiertos: sql<number>`
          COUNT(*) FILTER (WHERE ${tickets.estado} = ANY(ARRAY['abierto','en_progreso','en_espera']))::int
        `.as("abiertos"),
        vencidos: sql<number>`
          COUNT(*) FILTER (
            WHERE ${tickets.fechaLimite} < now()
            AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
          )::int
        `.as("vencidos"),
      })
      .from(tickets)
      .innerJoin(municipalidades, eq(tickets.tenantId, municipalidades.id))
      .groupBy(tickets.tenantId, municipalidades.slug, municipalidades.nombre),

    db
      .select({
        categoriaId: tickets.categoriaId,
        nombre: categorias.nombre,
        cantidad: count(),
      })
      .from(tickets)
      .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
      .groupBy(tickets.categoriaId, categorias.nombre)
      .orderBy(desc(count())),

    db
      .select({
        prioridadId: tickets.prioridadId,
        nombre: prioridades.nombre,
        cantidad: count(),
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .groupBy(tickets.prioridadId, prioridades.nombre)
      .orderBy(desc(count())),
  ]);

  const totalTickets = totalResult[0]?.cantidad ?? 0;
  const vencidos = vencidosResult[0]?.cantidad ?? 0;

  const byEstado = Object.fromEntries(
    statsByEstado.map((r) => [r.estado, r.cantidad]),
  );

  const abiertos = byEstado.abierto ?? 0;
  const enProgreso = byEstado.en_progreso ?? 0;
  const enEspera = byEstado.en_espera ?? 0;

  const totalActivos = estadosAbiertos.reduce(
    (sum, e) => sum + (byEstado[e] ?? 0),
    0,
  );
  const slaCompliance =
    totalActivos > 0
      ? Math.round(((totalActivos - vencidos) / totalActivos) * 100)
      : 100;

  const tiempoPromedioHoras = Number(
    tiempoPromedioResult[0]?.promedioHoras ?? 0,
  );

  const tendencia30Dias: TendenciaDia[] = tendenciaResult.map((r) => ({
    fecha: r.fecha,
    creados: r.creados,
    resueltos: r.resueltos,
  }));

  const porMunicipalidad: MunicipalidadResumen[] = porMunicipalidadResult.map(
    (r) => {
      const total = r.total;
      const mVencidos = r.vencidos;
      const totalActiv = r.abiertos;
      const mCompliance =
        totalActiv > 0
          ? Math.round(((totalActiv - mVencidos) / totalActiv) * 100)
          : 100;
      return {
        tenantSlug: r.tenantSlug,
        nombre: r.nombre,
        totalTickets: total,
        abiertos: r.abiertos,
        slaCompliance: mCompliance,
      };
    },
  );

  const porCategoria: CategoriaResumen[] = porCategoriaResult.map((r) => ({
    categoria: r.nombre,
    cantidad: r.cantidad,
  }));

  const porPrioridad: PrioridadResumen[] = porPrioridadResult.map((r) => ({
    prioridad: r.nombre,
    cantidad: r.cantidad,
  }));

  return {
    totalTickets,
    abiertos,
    enProgreso,
    enEspera,
    vencidosSla: vencidos,
    slaCompliance,
    tiempoPromedioHoras,
    tendencia30Dias,
    porMunicipalidad,
    porCategoria,
    porPrioridad,
  };
};

// ─── SLA Monitoreo ────────────────────────────────────────────────────────────

export const getSlaMonitoreo = async (): Promise<SlaMonitoreo> => {
  const [
    vencidosResult,
    enRiesgoResult,
    compliancePrioridadResult,
    complianceTenantResult,
  ] = await Promise.all([
    db
      .select({ cantidad: count() })
      .from(tickets)
      .where(
        and(
          lt(tickets.fechaLimite, sql`now()`),
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    db
      .select({ cantidad: count() })
      .from(tickets)
      .where(
        and(
          sql`${tickets.fechaLimite} BETWEEN now() AND now() + interval '4 hours'`,
          notInArray(tickets.estado, ["resuelto", "cerrado"]),
        ),
      ),

    db
      .select({
        prioridadId: tickets.prioridadId,
        nombre: prioridades.nombre,
        total: count(),
        vencidos: sql<number>`
            COUNT(*) FILTER (
              WHERE ${tickets.fechaLimite} < now()
              AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
            )::int
          `.as("vencidos"),
      })
      .from(tickets)
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .groupBy(tickets.prioridadId, prioridades.nombre, prioridades.nivel)
      .orderBy(prioridades.nivel),

    db
      .select({
        tenantId: tickets.tenantId,
        tenantSlug: municipalidades.slug,
        nombre: municipalidades.nombre,
        total: count(),
        vencidos: sql<number>`
            COUNT(*) FILTER (
              WHERE ${tickets.fechaLimite} < now()
              AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
            )::int
          `.as("vencidos"),
      })
      .from(tickets)
      .innerJoin(municipalidades, eq(tickets.tenantId, municipalidades.id))
      .groupBy(tickets.tenantId, municipalidades.slug, municipalidades.nombre),
  ]);

  const compliancePorPrioridad: CompliancePrioridad[] =
    compliancePrioridadResult.map((r) => {
      const total = r.total;
      const venc = r.vencidos;
      return {
        prioridadId: r.prioridadId,
        prioridadNombre: r.nombre,
        total,
        vencidos: venc,
        compliance:
          total > 0 ? Math.round(((total - venc) / total) * 100) : 100,
      };
    });

  const compliancePorTenant: ComplianceTenant[] = complianceTenantResult.map(
    (r) => {
      const total = r.total;
      const venc = r.vencidos;
      return {
        tenantId: r.tenantId,
        tenantSlug: r.tenantSlug,
        nombre: r.nombre,
        total,
        vencidos: venc,
        compliance:
          total > 0 ? Math.round(((total - venc) / total) * 100) : 100,
      };
    },
  );

  return {
    vencidos: vencidosResult[0]?.cantidad ?? 0,
    enRiesgo: enRiesgoResult[0]?.cantidad ?? 0,
    compliancePorPrioridad,
    compliancePorTenant,
  };
};

// ─── Tickets — lectura ────────────────────────────────────────────────────────

export const getTickets = async (
  filters: TicketFilters,
): Promise<TicketListResponse> => {
  const { page, pageSize, sortBy, sortOrder } = filters;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (filters.tenantSlug) {
    const [muni] = await db
      .select({ id: municipalidades.id })
      .from(municipalidades)
      .where(eq(municipalidades.slug, filters.tenantSlug));
    if (!muni) {
      return { tickets: [], total: 0, page, pageSize };
    }
    conditions.push(eq(tickets.tenantId, muni.id));
  }

  if (filters.estado) {
    conditions.push(eq(tickets.estado, filters.estado));
  }

  if (filters.prioridad) {
    const [prio] = await db
      .select({ id: prioridades.id })
      .from(prioridades)
      .where(eq(prioridades.codigo, filters.prioridad));
    if (prio) conditions.push(eq(tickets.prioridadId, prio.id));
  }

  if (filters.categoria) {
    const [cat] = await db
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.codigo, filters.categoria));
    if (cat) conditions.push(eq(tickets.categoriaId, cat.id));
  }

  if (filters.search) {
    conditions.push(
      sql`(
        ${tickets.titulo} ILIKE ${`%${filters.search}%`}
        OR ${tickets.numero} ILIKE ${`%${filters.search}%`}
        OR ${tickets.solicitanteNombre} ILIKE ${`%${filters.search}%`}
      )`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderColumn = (() => {
    switch (sortBy) {
      case "updatedAt":
        return tickets.updatedAt;
      case "estado":
        return tickets.estado;
      case "prioridad":
        return tickets.prioridadId;
      case "fechaLimite":
        return tickets.fechaLimite;
      default:
        return tickets.createdAt;
    }
  })();

  const orderFn = sortOrder === "asc" ? asc : desc;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: tickets.id,
        numero: tickets.numero,
        tenantId: tickets.tenantId,
        tenantSlug: municipalidades.slug,
        tenantNombre: municipalidades.nombre,
        titulo: tickets.titulo,
        estado: tickets.estado,
        prioridadId: tickets.prioridadId,
        prioridadNombre: prioridades.nombre,
        prioridadColor: prioridades.color,
        prioridadCodigo: prioridades.codigo,
        categoriaId: tickets.categoriaId,
        categoriaNombre: categorias.nombre,
        categoriaColor: categorias.color,
        solicitante: tickets.solicitanteNombre,
        asignado: tickets.asignadoNombre,
        fechaLimite: tickets.fechaLimite,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .innerJoin(municipalidades, eq(tickets.tenantId, municipalidades.id))
      .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
      .where(whereClause)
      .orderBy(orderFn(orderColumn))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(municipalidades, eq(tickets.tenantId, municipalidades.id))
      .where(whereClause),
  ]);

  const now = new Date();
  const items: TicketListItem[] = rows.map((r) => ({
    id: r.id,
    numero: r.numero,
    tenantId: r.tenantId,
    tenantSlug: r.tenantSlug,
    tenantNombre: r.tenantNombre,
    titulo: r.titulo,
    estado: r.estado,
    prioridadId: r.prioridadId,
    prioridadNombre: r.prioridadNombre,
    prioridadColor: r.prioridadColor,
    prioridadCodigo: r.prioridadCodigo,
    categoriaId: r.categoriaId,
    categoriaNombre: r.categoriaNombre,
    categoriaColor: r.categoriaColor,
    solicitante: r.solicitante,
    asignado: r.asignado,
    slaVencido:
      r.fechaLimite !== null &&
      r.fechaLimite < now &&
      !["resuelto", "cerrado"].includes(r.estado),
    fechaLimite: r.fechaLimite?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    tickets: items,
    total: countResult[0]?.total ?? 0,
    page,
    pageSize,
  };
};

export const getTicketDetail = async (
  tenantSlug: string,
  ticketId: number,
): Promise<TicketDetail> => {
  const [muni] = await db
    .select({
      id: municipalidades.id,
      slug: municipalidades.slug,
      nombre: municipalidades.nombre,
    })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!muni) throw new AppError(`Tenant '${tenantSlug}' no encontrado`, 404);

  const [ticket] = await db
    .select({
      id: tickets.id,
      numero: tickets.numero,
      titulo: tickets.titulo,
      descripcion: tickets.descripcion,
      estado: tickets.estado,
      prioridadId: tickets.prioridadId,
      prioridadNombre: prioridades.nombre,
      prioridadColor: prioridades.color,
      prioridadCodigo: prioridades.codigo,
      categoriaId: tickets.categoriaId,
      categoriaNombre: categorias.nombre,
      categoriaColor: categorias.color,
      solicitante: tickets.solicitanteNombre,
      emailSolicitante: tickets.solicitanteEmail,
      asignado: tickets.asignadoNombre,
      fechaLimite: tickets.fechaLimite,
      fechaResolucion: tickets.fechaResolucion,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .innerJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
    .innerJoin(categorias, eq(tickets.categoriaId, categorias.id))
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, muni.id)));

  if (!ticket) throw new AppError("Ticket no encontrado", 404);

  const [comsRows, histRows] = await Promise.all([
    db
      .select()
      .from(comentarios)
      .where(eq(comentarios.ticketId, ticketId))
      .orderBy(asc(comentarios.createdAt)),

    db
      .select()
      .from(historialEstados)
      .where(eq(historialEstados.ticketId, ticketId))
      .orderBy(asc(historialEstados.createdAt)),
  ]);

  const now = new Date();
  const slaVencido =
    ticket.fechaLimite !== null &&
    ticket.fechaLimite < now &&
    !["resuelto", "cerrado"].includes(ticket.estado);

  return {
    id: ticket.id,
    numero: ticket.numero,
    tenantId: muni.id,
    tenantSlug: muni.slug,
    tenantNombre: muni.nombre,
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    estado: ticket.estado,
    prioridadId: ticket.prioridadId,
    prioridadNombre: ticket.prioridadNombre,
    prioridadColor: ticket.prioridadColor,
    prioridadCodigo: ticket.prioridadCodigo,
    categoriaId: ticket.categoriaId,
    categoriaNombre: ticket.categoriaNombre,
    categoriaColor: ticket.categoriaColor,
    solicitante: ticket.solicitante,
    emailSolicitante: ticket.emailSolicitante,
    asignado: ticket.asignado,
    slaVencido,
    fechaLimite: ticket.fechaLimite?.toISOString() ?? null,
    fechaResolucion: ticket.fechaResolucion?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    comentarios: comsRows.map((c) => ({
      id: c.id,
      autorNombre: c.autorNombre,
      contenido: c.contenido,
      esInterno: c.esInterno,
      createdAt: c.createdAt.toISOString(),
    })),
    historial: histRows.map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      motivo: h.motivo,
      ejecutadoPor: h.ejecutadoPor,
      createdAt: h.createdAt.toISOString(),
    })),
  };
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function resolveTicketConTenant(
  tenantSlug: string,
  ticketId: number,
): Promise<{ ticket: typeof tickets.$inferSelect; tenantId: number }> {
  const [muni] = await db
    .select({ id: municipalidades.id })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!muni) throw new AppError(`Tenant '${tenantSlug}' no encontrado`, 404);

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.tenantId, muni.id)));

  if (!ticket) throw new AppError("Ticket no encontrado", 404);

  return { ticket, tenantId: muni.id };
}

// ─── Tickets — gestión operativa ─────────────────────────────────────────────

export const cambiarEstado = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarEstadoInput,
  ejecutadoPor: number,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  const estadoActual = ticket.estado as EstadoTicket;
  const estadoNuevo = input.estado;

  if (estadoActual === "cerrado") {
    throw new AppError(
      "El ticket está cerrado y no puede cambiar de estado",
      400,
    );
  }

  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];
  if (!transicionesPermitidas.includes(estadoNuevo)) {
    throw new AppError(
      `Transición inválida: '${estadoActual}' → '${estadoNuevo}'. Permitidas: ${transicionesPermitidas.join(", ")}`,
      400,
    );
  }

  const ahora = new Date();
  const updates: Partial<typeof tickets.$inferInsert> = {
    estado: estadoNuevo,
    updatedAt: ahora,
  };

  if (estadoNuevo === "resuelto") {
    updates.fechaResolucion = ahora;
  }

  // Reapertura: limpiar fecha_resolucion
  if (estadoActual === "resuelto" && estadoNuevo === "en_progreso") {
    updates.fechaResolucion = null;
  }

  await db.transaction(async (tx) => {
    await tx.update(tickets).set(updates).where(eq(tickets.id, ticketId));

    await tx.insert(historialEstados).values({
      ticketId,
      estadoAnterior: estadoActual,
      estadoNuevo,
      motivo: input.motivo,
      ejecutadoPor,
    });
  });
};

export const asignarTicket = async (
  tenantSlug: string,
  ticketId: number,
  input: AsignarTicketInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError("No se puede asignar un ticket cerrado", 400);
  }

  await db
    .update(tickets)
    .set({
      asignadoId: input.asignadoId,
      asignadoNombre: input.asignadoNombre,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));
};

export const cambiarPrioridad = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarPrioridadInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError(
      "No se puede cambiar la prioridad de un ticket cerrado",
      400,
    );
  }

  const [prio] = await db
    .select()
    .from(prioridades)
    .where(eq(prioridades.id, input.prioridadId));

  if (!prio) throw new AppError("Prioridad no encontrada", 404);

  const updates: Partial<typeof tickets.$inferInsert> = {
    prioridadId: input.prioridadId,
    updatedAt: new Date(),
  };

  if (input.recalcularSla && prio.slaHoras) {
    const nuevaFechaLimite = new Date(ticket.createdAt);
    nuevaFechaLimite.setHours(nuevaFechaLimite.getHours() + prio.slaHoras);
    updates.fechaLimite = nuevaFechaLimite;
  }

  await db.update(tickets).set(updates).where(eq(tickets.id, ticketId));
};

export const cambiarCategoria = async (
  tenantSlug: string,
  ticketId: number,
  input: CambiarCategoriaInput,
): Promise<void> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError(
      "No se puede cambiar la categoría de un ticket cerrado",
      400,
    );
  }

  const [cat] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(
      and(eq(categorias.id, input.categoriaId), eq(categorias.activo, true)),
    );

  if (!cat) throw new AppError("Categoría no encontrada o inactiva", 404);

  await db
    .update(tickets)
    .set({ categoriaId: input.categoriaId, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));
};

export const agregarComentario = async (
  tenantSlug: string,
  ticketId: number,
  input: AgregarComentarioInput,
  autorId: number,
  autorNombre: string,
): Promise<ComentarioDetalle> => {
  const { ticket } = await resolveTicketConTenant(tenantSlug, ticketId);

  if (ticket.estado === "cerrado") {
    throw new AppError("No se puede comentar en un ticket cerrado", 400);
  }

  const [nuevo] = await db
    .insert(comentarios)
    .values({
      ticketId,
      autorId,
      autorNombre,
      contenido: input.contenido,
      esInterno: input.esInterno,
    })
    .returning();

  await db
    .update(tickets)
    .set({ updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  return {
    id: nuevo.id,
    autorNombre: nuevo.autorNombre,
    contenido: nuevo.contenido,
    esInterno: nuevo.esInterno,
    createdAt: nuevo.createdAt.toISOString(),
  };
};

// ─── Tenants resumen ──────────────────────────────────────────────────────────

export const getTenantsSummary = async (): Promise<TenantResumen[]> => {
  const rows = await db
    .select({
      tenantId: tickets.tenantId,
      tenantSlug: municipalidades.slug,
      nombre: municipalidades.nombre,
      activo: municipalidades.activo,
      total: count(),
      abiertos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} = 'abierto')::int`.as(
          "abiertos",
        ),
      enProgreso:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} = 'en_progreso')::int`.as(
          "enProgreso",
        ),
      resueltos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} IN ('resuelto', 'cerrado'))::int`.as(
          "resueltos",
        ),
      vencidos: sql<number>`
        COUNT(*) FILTER (
          WHERE ${tickets.fechaLimite} < now()
          AND ${tickets.estado} NOT IN ('resuelto', 'cerrado')
        )::int
      `.as("vencidos"),
      activos:
        sql<number>`COUNT(*) FILTER (WHERE ${tickets.estado} NOT IN ('resuelto', 'cerrado'))::int`.as(
          "activos",
        ),
    })
    .from(tickets)
    .innerJoin(municipalidades, eq(tickets.tenantId, municipalidades.id))
    .groupBy(
      tickets.tenantId,
      municipalidades.slug,
      municipalidades.nombre,
      municipalidades.activo,
    );

  return rows.map((r) => {
    const totalActiv = r.activos;
    const venc = r.vencidos;
    const slaCompliance =
      totalActiv > 0
        ? Math.round(((totalActiv - venc) / totalActiv) * 100)
        : 100;
    return {
      tenantId: r.tenantId,
      tenantSlug: r.tenantSlug,
      nombre: r.nombre,
      totalTickets: r.total,
      abiertos: r.abiertos,
      enProgreso: r.enProgreso,
      resueltos: r.resueltos,
      slaCompliance,
      activo: r.activo,
    };
  });
};

// ─── Categorías ───────────────────────────────────────────────────────────────

export const getCategorias = async () => {
  return db
    .select()
    .from(categorias)
    .orderBy(asc(categorias.orden), asc(categorias.nombre));
};

export const createCategoria = async (input: CreateCategoriaInput) => {
  const [existing] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.codigo, input.codigo));

  if (existing) {
    throw new AppError(
      `Ya existe una categoría con el código '${input.codigo}'`,
      400,
    );
  }

  const [nueva] = await db.insert(categorias).values(input).returning();
  return nueva;
};

export const updateCategoria = async (
  id: number,
  input: UpdateCategoriaInput,
) => {
  const [existing] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) throw new AppError("Categoría no encontrada", 404);

  const [updated] = await db
    .update(categorias)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(categorias.id, id))
    .returning();

  return updated;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  const [existing] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.id, id));

  if (!existing) throw new AppError("Categoría no encontrada", 404);

  // Verificar si hay tickets usando esta categoría
  const [usage] = await db
    .select({ cantidad: count() })
    .from(tickets)
    .where(
      and(
        eq(tickets.categoriaId, id),
        inArray(tickets.estado, ["abierto", "en_progreso", "en_espera"]),
      ),
    );

  if ((usage?.cantidad ?? 0) > 0) {
    throw new AppError(
      "No se puede eliminar la categoría: tiene tickets activos asociados",
      400,
    );
  }

  // Soft delete
  await db
    .update(categorias)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(categorias.id, id));
};

// ─── Prioridades ──────────────────────────────────────────────────────────────

export const getPrioridades = async () => {
  return db.select().from(prioridades).orderBy(asc(prioridades.nivel));
};

export const updatePrioridad = async (
  id: number,
  input: UpdatePrioridadInput,
) => {
  const [existing] = await db
    .select({ id: prioridades.id })
    .from(prioridades)
    .where(eq(prioridades.id, id));

  if (!existing) throw new AppError("Prioridad no encontrada", 404);

  const updateData: Partial<typeof prioridades.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.nombre !== undefined) updateData.nombre = input.nombre;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.slaHoras !== undefined) updateData.slaHoras = input.slaHoras;

  const [updated] = await db
    .update(prioridades)
    .set(updateData)
    .where(eq(prioridades.id, id))
    .returning();

  return updated;
};
