import { db } from "@/app";
import {
  modulos,
  municipalidades,
  suscripciones,
} from "@municipal/shared/database/platform";
import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";

export interface ActiveModule {
  codigo: string;
  nombre: string;
  mfName: string | null;
  mfManifestUrlTpl: string | null;
  icono: string | null;
  apiPrefix: string;
}

export const getActiveModules = async (
  tenantSlug: string,
): Promise<ActiveModule[]> => {
  const result = await db
    .select({
      codigo: modulos.codigo,
      nombre: modulos.nombre,
      mfName: modulos.mfName,
      mfManifestUrlTpl: modulos.mfManifestUrlTpl,
      icono: modulos.icono,
      apiPrefix: modulos.apiPrefix,
    })
    .from(suscripciones)
    .innerJoin(modulos, eq(modulos.id, suscripciones.moduloId))
    .innerJoin(
      municipalidades,
      eq(municipalidades.id, suscripciones.municipalidadId),
    )
    .where(
      and(
        eq(municipalidades.slug, tenantSlug),
        eq(municipalidades.activo, true),
        inArray(suscripciones.estado, ["activa", "trial"]),
        or(
          isNull(suscripciones.fechaFin),
          gt(suscripciones.fechaFin, new Date()),
        ),
      ),
    );

  return result;
};
