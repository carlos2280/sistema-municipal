import { db } from "@/app";
import { municipalidades } from "@municipal/db-platform";
import { eq, or, sql } from "drizzle-orm";

export interface ResolveResult {
  slug: string;
  nombre: string;
  logoUrl: string | null;
  tema: unknown;
}

export const resolveByHost = async (
  host: string,
): Promise<ResolveResult | undefined> => {
  const [tenant] = await db
    .select({
      slug: municipalidades.slug,
      nombre: municipalidades.nombre,
      logoUrl: municipalidades.logoUrl,
      tema: municipalidades.tema,
    })
    .from(municipalidades)
    .where(
      sql`${municipalidades.activo} = true AND (${municipalidades.dominioBase} = ${host} OR ${host} = ANY(${municipalidades.dominiosCustom}))`,
    );

  return tenant;
};
