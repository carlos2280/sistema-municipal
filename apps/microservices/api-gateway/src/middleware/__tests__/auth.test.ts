import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────
// Note: env vars are set in vitest.config.ts to satisfy module-level Zod validation

vi.mock("jsonwebtoken", () => {
  const TokenExpiredError = class extends Error {
    constructor(message: string) {
      super(message);
      this.name = "TokenExpiredError";
    }
  };
  return {
    default: {
      verify: vi.fn(),
      TokenExpiredError,
    },
    TokenExpiredError,
  };
});

vi.mock("@municipal/core/auth", () => ({
  ALL_USER_HEADERS: [
    "x-user-id",
    "x-user-email",
    "x-user-nombre",
    "x-user-area-id",
    "x-user-sistema-id",
    "x-user-sub",
    "x-tenant-id",
    "x-tenant-slug",
    "x-tenant-db-name",
    "x-transversal-db-name",
    "x-secured-by",
  ],
}));

vi.mock("dotenv", async () => {
  const dotenv = await vi.importActual<typeof import("dotenv")>("dotenv");
  const path = await import("node:path");
  return {
    default: {
      config: (opts?: Record<string, unknown>) => {
        // Load from gateway .env, not monorepo root
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

const envMock = {
  env: {
    JWT_SECRET: "test-jwt-secret",
    NODE_ENV: "test",
    CORS_ORIGINS: "http://localhost:5030",
    PLATFORM_URL: "http://localhost:4060",
    ADMIN_API_KEY: "dev-admin-key-sistema-municipal-2024",
  },
};
vi.mock("@/config/env", () => envMock);

vi.mock("@/config/publicRoutes", () => ({
  isPublicRoute: vi.fn(),
}));

vi.mock("@/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { isPublicRoute } from "@/config/publicRoutes";
import jwt from "jsonwebtoken";
import { authenticateToken, stripUserHeaders } from "../auth";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    path: "/api/v1/test",
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

function createMockRes(): Response & { _status: number; _json: unknown } {
  const res: Record<string, unknown> = { _status: 0, _json: null };
  res.status = vi.fn((code: number) => {
    res._status = code;
    return res;
  });
  res.json = vi.fn((data: unknown) => {
    res._json = data;
    return res;
  });
  return res as unknown as Response & { _status: number; _json: unknown };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── stripUserHeaders ─────────────────────────────────────────────────

  describe("stripUserHeaders()", () => {
    it("debería eliminar headers x-user-* de requests entrantes", () => {
      const req = createMockReq({
        headers: {
          "x-user-id": "1",
          "x-user-email": "hacker@evil.com",
          "x-tenant-slug": "spoofed",
          "x-secured-by": "Fake",
          "content-type": "application/json",
        },
      });
      const next = vi.fn();

      stripUserHeaders(req, {} as Response, next);

      expect(req.headers["x-user-id"]).toBeUndefined();
      expect(req.headers["x-user-email"]).toBeUndefined();
      expect(req.headers["x-tenant-slug"]).toBeUndefined();
      expect(req.headers["x-secured-by"]).toBeUndefined();
      // Non x-user headers should remain
      expect(req.headers["content-type"]).toBe("application/json");
      expect(next).toHaveBeenCalled();
    });

    it("debería llamar next() incluso sin headers x-user-*", () => {
      const req = createMockReq({
        headers: { "content-type": "application/json" },
      });
      const next = vi.fn();

      stripUserHeaders(req, {} as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ─── authenticateToken ────────────────────────────────────────────────

  describe("authenticateToken()", () => {
    it("debería saltar validación para rutas públicas", () => {
      vi.mocked(isPublicRoute).mockReturnValue(true);
      const req = createMockReq({
        method: "POST",
        path: "/api/v1/autorizacion/login",
      });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("debería retornar 401 si no hay token", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      const req = createMockReq({ cookies: {}, headers: {} });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({
        mensaje: "No autorizado - Token no proporcionado",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("debería aceptar token válido desde cookie", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      vi.mocked(jwt.verify).mockReturnValue({
        sub: "1",
        userId: 1,
        email: "user@muni.cl",
        nombre: "User",
        areaId: 1,
        sistemaId: 1,
        tenantId: 1,
        tenantSlug: "default",
        tenantDbName: "muni_default",
        tipo: "access",
      } as never);

      const req = createMockReq({ cookies: { token: "valid-jwt" } });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.__gatewayUser).toBeDefined();
      expect(req.__gatewayUser).toHaveProperty("userId", 1);
    });

    it("debería aceptar token válido desde Authorization Bearer header", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      vi.mocked(jwt.verify).mockReturnValue({
        sub: "2",
        userId: 2,
        email: "admin@muni.cl",
        nombre: "Admin",
        areaId: 1,
        sistemaId: 1,
        tenantId: 1,
        tenantSlug: "default",
        tenantDbName: "muni_default",
        tipo: "access",
      } as never);

      const req = createMockReq({
        cookies: {},
        headers: { authorization: "Bearer valid-bearer-jwt" },
      });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-bearer-jwt",
        expect.any(String),
      );
      expect(next).toHaveBeenCalled();
    });

    it("debería retornar 401 si el token ha expirado", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw expiredError;
      });

      const req = createMockReq({ cookies: { token: "expired-jwt" } });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({ mensaje: "Token expirado" });
    });

    it("debería retornar 401 si el token es malformado", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      const req = createMockReq({ cookies: { token: "malformed-jwt" } });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({ mensaje: "Token inválido" });
    });

    it("debería rechazar refresh tokens usados como access tokens", () => {
      vi.mocked(isPublicRoute).mockReturnValue(false);
      vi.mocked(jwt.verify).mockReturnValue({
        sub: "1",
        userId: 1,
        tipo: "refresh",
      } as never);

      const req = createMockReq({ cookies: { token: "refresh-token-jwt" } });
      const res = createMockRes();
      const next = vi.fn();

      authenticateToken(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({
        mensaje: "No autorizado - Tipo de token incorrecto",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
