import type { DbClient } from "@/db/client";
import { AppError } from "@/libs/middleware/AppError";
import type {
  ActualizarTicketInput,
  AsignarTicketInput,
  CambiarEstadoInput,
  CrearTicketInput,
  TicketFiltersInput,
} from "@/libs/schemas/tickets.schemas";
import {
  categorias,
  comentarios,
  historialEstados,
  prioridades,
  tickets,
} from "@municipal/db-mesa-ayuda";
import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  abierto: ["en_progreso", "en_espera", "cerrado"],
  en_progreso: ["en_espera", "resuelto", "cerrado"],
  en_espera: ["en_progreso", "resuelto", "cerrado"],
  resuelto: ["cerrado", "en_progreso"],
};

async function generarNumero(db: DbClient, tenantId: number): Promise<string> {
  const result = await db
    .select({ numero: tickets.numero })
    .from(tickets)
    .where(eq(tickets.tenantId, tenantId))
    .orderBy(desc(tickets.id))
    .limit(1);

  if (result.length === 0) {
    return "TK-000001";
  }

  const ultimoNumero = result[0].numero;
  const secuencial = Number.parseInt(ultimoNumero.replace("TK-", ""), 10);
  return `TK-${String(secuencial + 1).padStart(6, "0")}`;
}

export async function listarTickets(
  db: DbClient,
  tenantId: number,
  filters: TicketFiltersInput,
) {
  const conditions = [eq(tickets.tenantId, tenantId)];

  if (filters.estado) {
    const estados = filters.estado.split(",");
    conditions.push(
      or(...estados.map((e) => eq(tickets.estado, e.trim()))) as ReturnType<typeof eq>,
    );
  }
  if (filters.categoriaId) {
    conditions.push(eq(tickets.categoriaId, filters.categoriaId));
  }
  if (filters.prioridadId) {
    conditions.push(eq(tickets.prioridadId, filters.prioridadId));
  }
  if (filters.asignadoId) {
    conditions.push(eq(tickets.asignadoId, filters.asignadoId));
  }
  if (filters.q) {
    conditions.push(
      or(
        ilike(tickets.titulo, `%${filters.q}%`),
        ilike(tickets.numero, `%${filters.q}%`),
      ) as ReturnType<typeof eq>,
    );
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.limit;

  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: tickets.id,
        numero: tickets.numero,
        titulo: tickets.titulo,
        estado: tickets.estado,
        categoriaId: tickets.categoriaId,
        categoriaNombre: categorias.nombre,
        categoriaColor: categorias.color,
        prioridadId: tickets.prioridadId,
        prioridadNombre: prioridades.nombre,
        prioridadColor: prioridades.color,
        prioridadNivel: prioridades.nivel,
        solicitanteNombre: tickets.solicitanteNombre,
        asignadoNombre: tickets.asignadoNombre,
        fechaLimite: tickets.fechaLimite,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .leftJoin(categorias, eq(tickets.categoriaId, categorias.id))
      .leftJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
      .where(where)
      .orderBy(desc(tickets.createdAt))
      .limit(filters.limit)
      .offset(offset),
    db.select({ total: count() }).from(tickets).where(where),
  ]);

  return {
    data,
    total: totalResult[0].total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(totalResult[0].total / filters.limit),
  };
}

export async function obtenerTicket(db: DbClient, tenantId: number, id: number) {
  const [ticket] = await db
    .select({
      id: tickets.id,
      numero: tickets.numero,
      titulo: tickets.titulo,
      descripcion: tickets.descripcion,
      estado: tickets.estado,
      categoriaId: tickets.categoriaId,
      categoriaNombre: categorias.nombre,
      categoriaColor: categorias.color,
      categoriaIcono: categorias.icono,
      prioridadId: tickets.prioridadId,
      prioridadNombre: prioridades.nombre,
      prioridadColor: prioridades.color,
      prioridadNivel: prioridades.nivel,
      solicitanteId: tickets.solicitanteId,
      solicitanteNombre: tickets.solicitanteNombre,
      solicitanteEmail: tickets.solicitanteEmail,
      asignadoId: tickets.asignadoId,
      asignadoNombre: tickets.asignadoNombre,
      departamento: tickets.departamento,
      fechaLimite: tickets.fechaLimite,
      fechaResolucion: tickets.fechaResolucion,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .leftJoin(categorias, eq(tickets.categoriaId, categorias.id))
    .leftJoin(prioridades, eq(tickets.prioridadId, prioridades.id))
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));

  if (!ticket) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const [ticketComentarios, historial] = await Promise.all([
    db
      .select()
      .from(comentarios)
      .where(eq(comentarios.ticketId, id))
      .orderBy(comentarios.createdAt),
    db
      .select()
      .from(historialEstados)
      .where(eq(historialEstados.ticketId, id))
      .orderBy(desc(historialEstados.createdAt)),
  ]);

  return { ...ticket, comentarios: ticketComentarios, historial };
}

export async function crearTicket(
  db: DbClient,
  tenantId: number,
  input: CrearTicketInput,
  solicitante: { id: number; nombre: string; email?: string },
) {
  const [prioridad] = await db
    .select({ slaHoras: prioridades.slaHoras })
    .from(prioridades)
    .where(eq(prioridades.id, input.prioridadId));

  if (!prioridad) {
    throw new AppError("Prioridad no encontrada", 400);
  }

  const numero = await generarNumero(db, tenantId);
  const fechaLimite = new Date(
    Date.now() + prioridad.slaHoras * 60 * 60 * 1000,
  );

  const [ticket] = await db
    .insert(tickets)
    .values({
      tenantId,
      numero,
      titulo: input.titulo,
      descripcion: input.descripcion,
      categoriaId: input.categoriaId,
      prioridadId: input.prioridadId,
      solicitanteId: solicitante.id,
      solicitanteNombre: solicitante.nombre,
      solicitanteEmail: solicitante.email,
      departamento: input.departamento,
      fechaLimite,
    })
    .returning();

  await db.insert(historialEstados).values({
    ticketId: ticket.id,
    estadoAnterior: null,
    estadoNuevo: "abierto",
    motivo: "Ticket creado",
    ejecutadoPor: solicitante.id,
  });

  return ticket;
}

export async function actualizarTicket(
  db: DbClient,
  tenantId: number,
  id: number,
  input: ActualizarTicketInput,
) {
  const [existing] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));

  if (!existing) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const [updated] = await db
    .update(tickets)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function cambiarEstado(
  db: DbClient,
  tenantId: number,
  id: number,
  input: CambiarEstadoInput,
  ejecutadoPor: number,
) {
  const [ticket] = await db
    .select({ id: tickets.id, estado: tickets.estado })
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));

  if (!ticket) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const permitidos = TRANSICIONES_VALIDAS[ticket.estado];
  if (!permitidos?.includes(input.estado)) {
    throw new AppError(
      `Transicion no permitida: ${ticket.estado} -> ${input.estado}`,
      400,
    );
  }

  const updateData: Record<string, unknown> = {
    estado: input.estado,
    updatedAt: new Date(),
  };

  if (input.estado === "resuelto") {
    updateData.fechaResolucion = new Date();
  }

  const [updated] = await db
    .update(tickets)
    .set(updateData)
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)))
    .returning();

  await db.insert(historialEstados).values({
    ticketId: id,
    estadoAnterior: ticket.estado,
    estadoNuevo: input.estado,
    motivo: input.motivo,
    ejecutadoPor,
  });

  return updated;
}

export async function asignarTicket(
  db: DbClient,
  tenantId: number,
  id: number,
  input: AsignarTicketInput,
) {
  const [existing] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));

  if (!existing) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const [updated] = await db
    .update(tickets)
    .set({
      asignadoId: input.asignadoId,
      asignadoNombre: input.asignadoNombre,
      updatedAt: new Date(),
    })
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)))
    .returning();

  return updated;
}

export async function eliminarTicket(db: DbClient, tenantId: number, id: number) {
  const [existing] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));

  if (!existing) {
    throw new AppError("Ticket no encontrado", 404);
  }

  await db.delete(tickets).where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));
}

export async function obtenerStats(db: DbClient, tenantId: number) {
  const now = new Date();

  const [estadoStats] = await db
    .select({
      total: count(),
      abiertos: count(sql`CASE WHEN ${tickets.estado} = 'abierto' THEN 1 END`),
      enProgreso: count(sql`CASE WHEN ${tickets.estado} = 'en_progreso' THEN 1 END`),
      enEspera: count(sql`CASE WHEN ${tickets.estado} = 'en_espera' THEN 1 END`),
      resueltos: count(sql`CASE WHEN ${tickets.estado} = 'resuelto' THEN 1 END`),
      cerrados: count(sql`CASE WHEN ${tickets.estado} = 'cerrado' THEN 1 END`),
    })
    .from(tickets)
    .where(eq(tickets.tenantId, tenantId));

  const [vencidosResult] = await db
    .select({ vencidos: count() })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        sql`${tickets.fechaLimite} < ${now}`,
        sql`${tickets.estado} NOT IN ('resuelto', 'cerrado')`,
      ),
    );

  return {
    ...estadoStats,
    vencidosSla: vencidosResult.vencidos,
  };
}
