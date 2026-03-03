import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptions as api } from "../lib/api";
import type { CreateSubscriptionInput, UpdateEstadoInput } from "../types";

export const subscriptionKeys = {
  byTenant: (tenantId: number) => ["subscriptions", tenantId] as const,
};

export function useSubscriptions(tenantId: number) {
  return useQuery({
    queryKey: subscriptionKeys.byTenant(tenantId),
    queryFn: () => api.listByTenant(tenantId),
    enabled: tenantId > 0,
  });
}

export function useCreateSubscription(tenantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionInput) => api.create(data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: subscriptionKeys.byTenant(tenantId),
      }),
  });
}

export function useUpdateSubscriptionEstado(tenantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEstadoInput }) =>
      api.updateEstado(id, data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: subscriptionKeys.byTenant(tenantId),
      }),
  });
}
