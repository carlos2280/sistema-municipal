import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenants as api } from "../lib/api";
import type { CreateTenantInput, UpdateTenantInput } from "../types";

export const tenantKeys = {
  all: ["tenants"] as const,
  detail: (id: number) => ["tenants", id] as const,
};

export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: api.list,
  });
}

export function useTenant(id: number) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => api.get(id),
    enabled: id > 0,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) => api.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

export function useUpdateTenant(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTenantInput) => api.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
      qc.invalidateQueries({ queryKey: tenantKeys.detail(id) });
    },
  });
}

export function useDeactivateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
