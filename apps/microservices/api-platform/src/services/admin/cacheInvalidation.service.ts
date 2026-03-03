import { getEnv } from "@/config/env";

/**
 * Calls gateway's internal endpoint to invalidate the subscription cache
 * for a specific tenant. Fire-and-forget — does not throw on failure.
 */
export async function invalidateTenantCache(
  tenantSlug: string,
): Promise<void> {
  const env = getEnv();
  const url = `${env.GATEWAY_INTERNAL_URL}/internal/cache/invalidate`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": env.ADMIN_API_KEY,
      },
      body: JSON.stringify({ tenantSlug }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      console.warn(
        `[CacheInvalidation] Gateway returned ${res.status} for tenant ${tenantSlug}`,
      );
    }
  } catch (err) {
    console.warn(
      `[CacheInvalidation] Failed to notify gateway for ${tenantSlug}:`,
      (err as Error).message,
    );
  }
}
