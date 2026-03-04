import type { DbClient } from "@/db/client";
import { departamentos, direcciones, oficinas, usuarios } from "@/db/schemas";
import { and, asc, eq } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface OrgUsuario {
  id: number;
  nombre: string;
  email: string;
}

export interface OrgOficina {
  id: number;
  nombre: string;
  responsable: string;
  usuarios: OrgUsuario[];
}

export interface OrgDepartamento {
  id: number;
  nombre: string;
  responsable: string;
  oficinas: OrgOficina[];
}

export interface OrgDireccion {
  id: number;
  nombre: string;
  responsable: string;
  departamentos: OrgDepartamento[];
}

// ============================================================================
// Service
// ============================================================================

export const getOrganigrama = async (db: DbClient): Promise<OrgDireccion[]> => {
  try {
    const rows = await db
      .select({
        dirId: direcciones.id,
        dirNombre: direcciones.nombre,
        dirResponsable: direcciones.responsable,
        depId: departamentos.id,
        depNombre: departamentos.nombreDepartamento,
        depResponsable: departamentos.responsable,
        ofId: oficinas.id,
        ofNombre: oficinas.nombreOficina,
        ofResponsable: oficinas.responsable,
        usrId: usuarios.id,
        usrNombre: usuarios.nombreCompleto,
        usrEmail: usuarios.email,
      })
      .from(direcciones)
      .leftJoin(departamentos, eq(departamentos.idDireccion, direcciones.id))
      .leftJoin(oficinas, eq(oficinas.idDepartamento, departamentos.id))
      .leftJoin(
        usuarios,
        and(eq(usuarios.idOficina, oficinas.id), eq(usuarios.activo, true)),
      )
      .orderBy(
        asc(direcciones.id),
        asc(departamentos.id),
        asc(oficinas.id),
        asc(usuarios.id),
      );

    // Transformar filas planas en árbol anidado
    const dirMap = new Map<number, OrgDireccion>();

    for (const row of rows) {
      if (!dirMap.has(row.dirId)) {
        dirMap.set(row.dirId, {
          id: row.dirId,
          nombre: row.dirNombre,
          responsable: row.dirResponsable,
          departamentos: [],
        });
      }
      const dir = dirMap.get(row.dirId)!;

      if (row.depId === null) continue;

      let dep = dir.departamentos.find((d) => d.id === row.depId);
      if (!dep) {
        dep = {
          id: row.depId,
          nombre: row.depNombre!,
          responsable: row.depResponsable!,
          oficinas: [],
        };
        dir.departamentos.push(dep);
      }

      if (row.ofId === null) continue;

      let of_ = dep.oficinas.find((o) => o.id === row.ofId);
      if (!of_) {
        of_ = {
          id: row.ofId,
          nombre: row.ofNombre!,
          responsable: row.ofResponsable!,
          usuarios: [],
        };
        dep.oficinas.push(of_);
      }

      if (row.usrId !== null && !of_.usuarios.find((u) => u.id === row.usrId)) {
        of_.usuarios.push({
          id: row.usrId,
          nombre: row.usrNombre!,
          email: row.usrEmail,
        });
      }
    }

    return Array.from(dirMap.values());
  } catch (error) {
    throw new Error(
      `Error al obtener el organigrama: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
