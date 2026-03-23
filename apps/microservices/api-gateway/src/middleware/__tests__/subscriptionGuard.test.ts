import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("dotenv", async () => {
  const dotenv = await vi.importActual<typeof import("dotenv")>("dotenv");
  const path = await import("node:path");
  return {
    default: {
      config: (opts?: Record<string, unknown>) => {
        const envPath = path.resolve(__dirname, "../../../.env");
        return dotenv.config({ ...opts, path: envPath });
      },
    },
    config: (opts?: Record<string, unknown>) => {
      const envPath = path.resolve(__dirname, "../../../.env");
      return dotenv.config({ ...opts, path: envPath });
    },
  };
});

vi.mock("@/config/env", () => ({
  env: {
    PLATFORM_URL: "http://localhost:4060",
    NODE_ENV: "test",
    JWT_SECRET: "test-jwt-secret",
    CORS_ORIGINS: "http://localhost:5030",
    ADMIN_API_KEY: "dev-admin-key-sistema-municipal-2024",
  },
}));

vi.mock("@/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import {
  subscriptionGuard,
  clearSubscriptionCache,
  invalidateSubscriptionCache,
} from "../subscriptionGuard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockReq(
  path: string,
  gatewayUser?: { tenantSlug: string; userId: number },
): Request {
  return {
    method: "GET",
    path,
    __gatewayUser: gatewayUser,
  } as unknown as Request;
}

function createMockRes(): Response & { _status: number; _json: unknown } {
  const res = {
    _status: 0,
    _json: null as unknown,
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status = vi.fn().mockImplementation((code: number) => {
    res._status = code;
    return res;
  }) as unknown as Response["status"];
  res.json = vi.fn().mockImplementation((data: unknown) => {
    res._json = data;
    return res;
  }) as unknown as Response["json"];
  return res as unknown as Response & { _status: number; _json: unknown };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("subscriptionGuard middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSubscriptionCache();
    vi.restoreAllMocks();
  });

  it("debería pasar sin restricción si no hay usuario autenticado (ruta pública)", async () => {
    const req = createMockReq("/api/v1/autorizacion/login");
    const res = createMockRes();
    const next = vi.fn();

    await subscriptionGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("debería pasar si la ruta es core (no mapeada a módulo)", async () => {
    const req = createMockReq("/api/v1/identidad/usuarios", {
      tenantSlug: "default",
      userId: 1,
    });
    const res = createMockRes();
    const next = vi.fn();

    await subscriptionGuard(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("debería permitir acceso a módulo suscrito", async () => {
    // Mock fetch to return active modules including contabilidad
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ codigo: "contabilidad" }, { codigo: "chat" }]),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockReq("/api/v1/contabilidad/cuentas", {
      tenantSlug: "default",
      userId: 1,
    });
    const res = createMockRes();
    const next = vi.fn();

    await subscriptionGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("debería bloquear acceso a módulo no suscrito con 403", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ codigo: "chat" }]), // no contabilidad
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockReq("/api/v1/contabilidad/cuentas", {
      tenantSlug: "default",
      userId: 1,
    });
    const res = createMockRes();
    const next = vi.fn();

    await subscriptionGuard(req, res, next);

    expect(res._status).toBe(403);
    expect(res._json).toHaveProperty("code", "MODULE_NOT_SUBSCRIBED");
    expect(next).not.toHaveBeenCalled();
  });

  it("debería hacer fail-open si la verificación de suscripción falla", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockReq("/api/v1/contabilidad/cuentas", {
      tenantSlug: "default",
      userId: 1,
    });
    const res = createMockRes();
    const next = vi.fn();

    await subscriptionGuard(req, res, next);

    // Fail-open: should call next despite error
    expect(next).toHaveBeenCalled();
  });

  it("invalidateSubscriptionCache debería limpiar cache de un tenant", () => {
    // Just verify it doesn't throw
    expect(() => invalidateSubscriptionCache("default")).not.toThrow();
  });

  it("clearSubscriptionCache debería limpiar todo el cache", () => {
    expect(() => clearSubscriptionCache()).not.toThrow();
  });
});
