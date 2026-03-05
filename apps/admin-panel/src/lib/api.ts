import type {
  CreateSubscriptionInput,
  CreateTenantInput,
  Module,
  Subscription,
  Tenant,
  UpdateEstadoInput,
  UpdateTenantInput,
} from "../types";
import { clearApiKey, getApiKey } from "./auth";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_PREFIX = "/api/v1/admin";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError(401, "No hay API key configurada");
  }

  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": apiKey,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearApiKey();
    window.location.reload();
    throw new ApiError(401, "API key inválida");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      (body as { message?: string }).message || res.statusText,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const tenants = {
  list: () => request<Tenant[]>("/tenants"),
  get: (id: number) => request<Tenant>(`/tenants/${id}`),
  create: (data: CreateTenantInput) =>
    request<Tenant>("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateTenantInput) =>
    request<Tenant>(`/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deactivate: (id: number) =>
    request<void>(`/tenants/${id}`, { method: "DELETE" }),
};

export const subscriptions = {
  listByTenant: (tenantId: number) =>
    request<Subscription[]>(`/subscriptions?tenantId=${tenantId}`),
  create: (data: CreateSubscriptionInput) =>
    request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEstado: (id: number, data: UpdateEstadoInput) =>
    request<Subscription>(`/subscriptions/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const modules = {
  list: () => request<Module[]>("/modules"),
};
