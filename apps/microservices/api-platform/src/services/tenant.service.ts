import { db } from "@/app";
import { municipalidades } from "@municipal/db-platform";
import { eq } from "drizzle-orm";

export interface TenantTransversalInfo {
  transversalDbName: string;
}

/**
 * Retorna el nombre de la DB transversal de un tenant dado su ID.
 * Usado por api-gateway para inyectar el header x-transversal-db-name.
 */
export const getTransversalDbName = async (
  tenantId: number,
): Promise<TenantTransversalInfo | undefined> => {
  const [row] = await db
    .select({
      transversalDbName: municipalidades.transversalDbName,
    })
    .from(municipalidades)
    .where(eq(municipalidades.id, tenantId));

  return row;
};
