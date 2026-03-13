import { platformDb } from "@/app";
import { AppError } from "@/libs/middleware/AppError";
import { municipalidades } from "@municipal/db-platform";
import { eq } from "drizzle-orm";

export type MfaPolicy = "required" | "optional" | "disabled";

export const getMfaPolicy = async (tenantSlug: string): Promise<MfaPolicy> => {
  const [tenant] = await platformDb
    .select({ mfaPolicy: municipalidades.mfaPolicy })
    .from(municipalidades)
    .where(eq(municipalidades.slug, tenantSlug));

  if (!tenant) throw new AppError("Tenant no encontrado", 404);
  return (tenant.mfaPolicy ?? "optional") as MfaPolicy;
};

export const updateMfaPolicy = async (
  tenantSlug: string,
  policy: MfaPolicy,
): Promise<void> => {
  const result = await platformDb
    .update(municipalidades)
    .set({ mfaPolicy: policy, updatedAt: new Date() })
    .where(eq(municipalidades.slug, tenantSlug));

  if (!result) throw new AppError("Tenant no encontrado", 404);
};
