import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks de dependencias externas ─────────────────────────────────────────

// Mock de bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

// Mock de otplib
vi.mock("otplib", () => ({
  authenticator: {
    verify: vi.fn(),
    generateSecret: vi.fn(),
    keyuri: vi.fn(),
  },
}));

// Mock de qrcode
vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn() },
}));

// Mock de drizzle-orm operators
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
  and: vi.fn((...args: unknown[]) => ({ _and: args })),
  gt: vi.fn(),
  inArray: vi.fn(),
  isNull: vi.fn(),
  or: vi.fn(),
}));

// Mock DB schemas
vi.mock("@municipal/db-identidad", () => ({
  usuarios: { id: "id", email: "email", password: "password" },
  areas: { id: "id", nombre: "nombre", descripcion: "descripcion" },
  menus: {
    id: "id",
    idSistema: "idSistema",
    orden: "orden",
    idPadre: "idPadre",
  },
  perfilAreaUsuario: {
    usuarioId: "usuarioId",
    areaId: "areaId",
    perfilId: "perfilId",
  },
  refreshTokens: { jti: "jti", revocado: "revocado" },
  sistemaPerfil: { sistemaId: "sistemaId", perfilId: "perfilId" },
  sistemas: { id: "id", nombre: "nombre", codigo: "codigo" },
  tokensContrasenaTemporal: { token: "token" },
}));

vi.mock("@municipal/db-platform", () => ({
  municipalidades: {
    id: "id",
    slug: "slug",
    activo: "activo",
    dbName: "dbName",
  },
  modulos: { id: "id", codigo: "codigo" },
  suscripciones: {
    moduloId: "moduloId",
    municipalidadId: "municipalidadId",
    estado: "estado",
    fechaFin: "fechaFin",
  },
}));

vi.mock("@municipal/core", () => ({
  BCRYPT_ROUNDS: 12,
  generateBackupCodes: vi.fn(() => [
    "ABCDE-12345",
    "FGHIJ-67890",
    "KLMNO-11111",
    "PQRST-22222",
    "UVWXY-33333",
    "ZABCD-44444",
    "EFGHI-55555",
    "JKLMN-66666",
  ]),
}));

// Mock crypto utils
vi.mock("@/libs/utils/crypto.utils", () => ({
  encryptSecret: vi.fn((s: string) => `encrypted_${s}`),
  decryptSecret: vi.fn((s: string) => s.replace("encrypted_", "")),
}));

// Mock email service
vi.mock("@/libs/email/emailService", () => ({
  enviarEmailEnrollmentMfa: vi.fn(() => Promise.resolve()),
  enviarEmailMfaActivado: vi.fn(() => Promise.resolve()),
}));

// Mock jwt utils
const mockGenerarTokens = vi.fn(() => ({
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  refreshTokenJti: "mock-jti-uuid",
  expiresIn: 900,
}));

const mockVerificarToken = vi.fn();
const mockGenerarTokenSetup = vi.fn(() => "mock-setup-token");

vi.mock("@/libs/utils/jwt.utils", () => ({
  generarTokens: (...args: unknown[]) => mockGenerarTokens(...args),
  verificarToken: (...args: unknown[]) => mockVerificarToken(...args),
  generarTokenSetup: (...args: unknown[]) => mockGenerarTokenSetup(...args),
}));

// Mock config/env
vi.mock("@/config/env", () => ({
  loadEnv: () => ({
    JWT_SECRET: "test-secret",
    JWT_ISSUER: "test-issuer",
    DB_USER: "test",
    DB_PASSWORD: "test",
    DB_HOST: "localhost",
    DB_PORT: 5432,
    DB_NAME: "test",
    DB_SSL: false,
    MFA_ENCRYPTION_KEY: "0".repeat(64),
  }),
  getEnv: () => ({
    MFA_ENCRYPTION_KEY: "0".repeat(64),
  }),
}));

// Mock tenant DB client
const mockTenantDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  query: {
    perfilAreaUsuario: { findFirst: vi.fn() },
    usuarios: { findFirst: vi.fn() },
  },
  transaction: vi.fn(),
};

// Chainable select — soporta tanto .where() (resuelve) como .where().limit() (resuelve)
function chainableSelect(rows: unknown[]) {
  // Crea un objeto que es Promise-like Y tiene métodos de chaining
  function makeWhereResult() {
    const result = Promise.resolve(rows) as Promise<unknown[]> & {
      limit: ReturnType<typeof vi.fn>;
    };
    result.limit = vi.fn().mockResolvedValue(rows);
    return result;
  }

  const chain = {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue(makeWhereResult()),
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(rows),
        }),
        where: vi.fn().mockResolvedValue(rows),
      }),
    }),
  };
  return chain;
}

vi.mock("@/db/client", () => ({
  createTenantDbClient: vi.fn(() => mockTenantDb),
}));

// Mock platformDb via @/app
const mockPlatformDb = {
  select: vi.fn(),
};

vi.mock("@/app", () => ({
  platformDb: new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "select") return mockPlatformDb.select;
        return undefined;
      },
    },
  ),
}));

// ─── Imports del SUT ─────────────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import {
  cambiarContrasenaTemporal,
  cerrarSesion,
  login,
  refrescarToken,
} from "../autorizacion.service";

// ─── Test data ───────────────────────────────────────────────────────────────

const mockUsuario = {
  id: 1,
  email: "admin@muni.cl",
  password: "$2a$12$hashedPassword",
  nombreCompleto: "Admin Municipal",
  activo: true,
  mfaEnabled: false,
  mfaVerified: false,
  mfaSecret: null,
  mfaBackupCodes: null,
  passwordTemp: false,
};

const mockTenant = {
  id: 1,
  slug: "default",
  nombre: "Municipalidad Default",
  dbName: "muni_default",
  activo: true,
  mfaPolicy: "optional",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("autorizacion.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── login() ────────────────────────────────────────────────────────────

  describe("login()", () => {
    function setupLoginMocks(
      tenant: typeof mockTenant | undefined,
      usuario: typeof mockUsuario | undefined,
      passwordValid = true,
    ) {
      // platformDb.select() chain for tenant lookup
      mockPlatformDb.select.mockReturnValue(
        chainableSelect(tenant ? [tenant] : []),
      );

      // tenantDb.select() chain for user lookup
      mockTenantDb.select.mockReturnValue(
        chainableSelect(usuario ? [usuario] : []),
      );

      // validarAreasUsuario
      mockTenantDb.query.perfilAreaUsuario.findFirst.mockResolvedValue(
        usuario ? { area: { id: 1, nombre: "Administración" } } : null,
      );

      vi.mocked(bcrypt.compare).mockResolvedValue(passwordValid as never);

      // insert refresh token
      mockTenantDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
    }

    it("debería retornar tokens con credenciales válidas", async () => {
      setupLoginMocks(mockTenant, mockUsuario, true);

      const result = await login({
        correo: "admin@muni.cl",
        contrasena: "password123",
        areaId: 1,
        sistemaId: 1,
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("usuario");
      expect(mockGenerarTokens).toHaveBeenCalled();
    });

    it("debería lanzar error con contraseña incorrecta", async () => {
      setupLoginMocks(mockTenant, mockUsuario, false);

      await expect(
        login({
          correo: "admin@muni.cl",
          contrasena: "wrong",
          areaId: 1,
          sistemaId: 1,
        }),
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debería lanzar error si el usuario no existe", async () => {
      setupLoginMocks(mockTenant, undefined);

      await expect(
        login({
          correo: "noexiste@muni.cl",
          contrasena: "password123",
          areaId: 1,
          sistemaId: 1,
        }),
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debería lanzar error si la municipalidad no existe", async () => {
      setupLoginMocks(undefined, undefined);

      await expect(
        login({
          correo: "admin@muni.cl",
          contrasena: "password123",
          areaId: 1,
          sistemaId: 1,
        }),
      ).rejects.toThrow("Municipalidad no encontrada");
    });

    it("debería lanzar error si la municipalidad está inactiva", async () => {
      setupLoginMocks({ ...mockTenant, activo: false }, mockUsuario);

      await expect(
        login({
          correo: "admin@muni.cl",
          contrasena: "password123",
          areaId: 1,
          sistemaId: 1,
        }),
      ).rejects.toThrow("Municipalidad inactiva");
    });

    it("debería retornar mfaRequired cuando MFA activo sin código", async () => {
      const usuarioMfa = {
        ...mockUsuario,
        mfaEnabled: true,
        mfaVerified: true,
        mfaSecret: "encrypted_secret123",
      };
      setupLoginMocks(mockTenant, usuarioMfa, true);

      const result = await login({
        correo: "admin@muni.cl",
        contrasena: "password123",
        areaId: 1,
        sistemaId: 1,
      });

      expect(result).toEqual({
        mfaRequired: true,
        userId: 1,
      });
    });

    it("debería validar código TOTP cuando MFA activo con código válido", async () => {
      const usuarioMfa = {
        ...mockUsuario,
        mfaEnabled: true,
        mfaVerified: true,
        mfaSecret: "encrypted_secret123",
      };
      setupLoginMocks(mockTenant, usuarioMfa, true);
      vi.mocked(authenticator.verify).mockReturnValue(true);

      const result = await login({
        correo: "admin@muni.cl",
        contrasena: "password123",
        areaId: 1,
        sistemaId: 1,
        mfaCode: "123456",
      });

      expect(result).toHaveProperty("accessToken");
      expect(authenticator.verify).toHaveBeenCalledWith({
        token: "123456",
        secret: "secret123",
      });
    });

    it("debería lanzar error con código TOTP inválido", async () => {
      const usuarioMfa = {
        ...mockUsuario,
        mfaEnabled: true,
        mfaVerified: true,
        mfaSecret: "encrypted_secret123",
      };
      setupLoginMocks(mockTenant, usuarioMfa, true);
      vi.mocked(authenticator.verify).mockReturnValue(false);

      await expect(
        login({
          correo: "admin@muni.cl",
          contrasena: "password123",
          areaId: 1,
          sistemaId: 1,
          mfaCode: "000000",
        }),
      ).rejects.toThrow("Código MFA inválido");
    });

    it("debería validar backup code cuando MFA activo", async () => {
      const usuarioMfa = {
        ...mockUsuario,
        mfaEnabled: true,
        mfaVerified: true,
        mfaSecret: "encrypted_secret123",
        mfaBackupCodes: ["$2a$12$hashedBackup1", "$2a$12$hashedBackup2"],
      };
      setupLoginMocks(mockTenant, usuarioMfa, true);
      // bcrypt.compare: first call for password, second for backup code
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(true as never) // password
        .mockResolvedValueOnce(true as never); // backup code match

      mockTenantDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await login({
        correo: "admin@muni.cl",
        contrasena: "password123",
        areaId: 1,
        sistemaId: 1,
        mfaCode: "ABCDE-12345",
      });

      expect(result).toHaveProperty("accessToken");
    });

    it("debería retornar mfaSetupPending cuando política es required y usuario sin MFA", async () => {
      const tenantRequired = { ...mockTenant, mfaPolicy: "required" };
      setupLoginMocks(tenantRequired, mockUsuario, true);

      const result = await login({
        correo: "admin@muni.cl",
        contrasena: "password123",
        areaId: 1,
        sistemaId: 1,
      });

      expect(result).toHaveProperty("mfaSetupPending", true);
      expect(result).toHaveProperty("userId", 1);
    });

    it("debería lanzar error si el usuario no tiene áreas asignadas", async () => {
      mockPlatformDb.select.mockReturnValue(chainableSelect([mockTenant]));
      mockTenantDb.select.mockReturnValue(chainableSelect([mockUsuario]));
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockTenantDb.query.perfilAreaUsuario.findFirst.mockResolvedValue(null);

      await expect(
        login({
          correo: "admin@muni.cl",
          contrasena: "password123",
          areaId: 999,
          sistemaId: 1,
        }),
      ).rejects.toThrow("No se encontraron areas");
    });
  });

  // ─── refrescarToken() ──────────────────────────────────────────────────

  describe("refrescarToken()", () => {
    const validPayload = {
      sub: "1",
      userId: 1,
      email: "admin@muni.cl",
      nombre: "Admin",
      areaId: 1,
      sistemaId: 1,
      tenantId: 1,
      tenantSlug: "default",
      tenantDbName: "muni_default",
      tipo: "refresh" as const,
      jti: "valid-jti",
    };

    it("debería generar nuevos tokens con refresh token válido", async () => {
      mockVerificarToken.mockReturnValue(validPayload);

      // DB: jti not revoked
      mockTenantDb.select.mockReturnValue(
        chainableSelect([{ revocado: false }]),
      );

      // DB: user exists and active
      const selectForUser = chainableSelect([mockUsuario]);
      mockTenantDb.select
        .mockReturnValueOnce(chainableSelect([{ revocado: false }]))
        .mockReturnValueOnce(selectForUser);

      mockTenantDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<void>) => {
          const tx = {
            update: vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockResolvedValue(undefined),
            }),
          };
          await cb(tx);
        },
      );

      const result = await refrescarToken("valid-refresh-jwt");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockGenerarTokens).toHaveBeenCalled();
    });

    it("debería lanzar error con refresh token inválido", async () => {
      mockVerificarToken.mockReturnValue(null);

      await expect(refrescarToken("invalid-jwt")).rejects.toThrow(
        "Refresh token inválido o expirado",
      );
    });

    it("debería lanzar error si el token no es de tipo refresh", async () => {
      mockVerificarToken.mockReturnValue({ ...validPayload, tipo: "access" });

      await expect(refrescarToken("access-token-jwt")).rejects.toThrow(
        "El token proporcionado no es un refresh token",
      );
    });

    it("debería lanzar error si el refresh token está revocado", async () => {
      mockVerificarToken.mockReturnValue(validPayload);
      mockTenantDb.select.mockReturnValue(
        chainableSelect([{ revocado: true }]),
      );

      await expect(refrescarToken("revoked-jwt")).rejects.toThrow(
        "Refresh token revocado",
      );
    });
  });

  // ─── cerrarSesion() (logout) ───────────────────────────────────────────

  describe("cerrarSesion()", () => {
    it("debería revocar el refresh token en la DB", async () => {
      mockVerificarToken.mockReturnValue({
        userId: 1,
        tenantDbName: "muni_default",
        jti: "valid-jti",
      });

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockTenantDb.update.mockReturnValue({ set: mockSet });

      await cerrarSesion("valid-refresh-jwt");

      expect(mockTenantDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ revocado: true });
    });

    it("debería no lanzar error si el token es inválido (ya expirado)", async () => {
      mockVerificarToken.mockReturnValue(null);

      await expect(cerrarSesion("invalid-jwt")).resolves.toBeUndefined();
    });
  });

  // ─── cambiarContrasenaTemporal() ───────────────────────────────────────

  describe("cambiarContrasenaTemporal()", () => {
    const mockDb = {
      select: vi.fn(),
      transaction: vi.fn(),
    } as unknown as Parameters<typeof cambiarContrasenaTemporal>[0];

    it("debería actualizar contraseña con credenciales temporales válidas", async () => {
      const usuario = { ...mockUsuario, passwordTemp: true };
      (mockDb as Record<string, unknown>).select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([usuario]),
        }),
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("$2a$12$newHash" as never);
      (mockDb as Record<string, unknown>).transaction = vi.fn(
        async (cb: (tx: unknown) => Promise<void>) => {
          const tx = {
            update: vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
              }),
            }),
          };
          await cb(tx);
        },
      );

      const result = await cambiarContrasenaTemporal(
        mockDb as never,
        "tempPassword",
        "newSecurePassword123",
        "admin@muni.cl",
        "temp-token",
      );

      expect(result).toEqual({
        success: true,
        mensaje: "Contraseña actualizada correctamente",
      });
    });

    it("debería lanzar error con contraseña temporal incorrecta", async () => {
      const usuario = { ...mockUsuario, passwordTemp: true };
      (mockDb as Record<string, unknown>).select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([usuario]),
        }),
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        cambiarContrasenaTemporal(
          mockDb as never,
          "wrongTemp",
          "newPassword",
          "admin@muni.cl",
          "temp-token",
        ),
      ).rejects.toThrow("Contraseña temporal incorrecta");
    });

    it("debería lanzar error si email o contraseña están vacíos", async () => {
      await expect(
        cambiarContrasenaTemporal(
          mockDb as never,
          "",
          "newPassword",
          "admin@muni.cl",
          "token",
        ),
      ).rejects.toThrow("Credenciales inválidas");
    });
  });
});
