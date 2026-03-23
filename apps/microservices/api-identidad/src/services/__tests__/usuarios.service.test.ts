import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$hashedPassword"),
    compare: vi.fn(),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
  and: vi.fn((...args: unknown[]) => ({ _and: args })),
  isNull: vi.fn((_col: unknown) => ({ _isNull: true })),
}));

vi.mock("@municipal/db-identidad", () => ({
  usuarios: { id: "id", email: "email" },
}));

vi.mock("@municipal/core", () => ({
  BCRYPT_ROUNDS: 12,
}));

vi.mock("@/libs/utils/contrasenaAleatoria.utils", () => ({
  generateRandomPassword: vi.fn(() => "randomPass123"),
}));

// Mock email service — don't send real emails
const mockSendWelcomeEmail = vi.fn().mockResolvedValue({ success: true });
vi.mock("../email.service", () => ({
  sendWelcomeEmail: (...args: unknown[]) => mockSendWelcomeEmail(...args),
}));

// ─── Mock DB client ──────────────────────────────────────────────────────────

interface MockDbClient {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  query: {
    usuarios: { findMany: ReturnType<typeof vi.fn> };
  };
}

function createMockDb(): MockDbClient {
  return {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      usuarios: { findMany: vi.fn() },
    },
  };
}

// ─── Imports ─────────────────────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import {
  createUsuario,
  deleteUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
} from "../usuarios.service";

// ─── Test data ───────────────────────────────────────────────────────────────

const mockUsuario = {
  id: 1,
  email: "user@muni.cl",
  nombreCompleto: "Test User",
  password: "$2a$12$hashedPassword",
  activo: true,
  passwordTemp: true,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("usuarios.service", () => {
  let db: MockDbClient;

  beforeEach(() => {
    vi.clearAllMocks();
    db = createMockDb();
  });

  // ─── createUsuario() ──────────────────────────────────────────────────

  describe("createUsuario()", () => {
    it("debería crear un usuario con contraseña hasheada y passwordTemp=true", async () => {
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUsuario]),
        }),
      });

      const result = await createUsuario(
        db as never,
        {
          email: "user@muni.cl",
          nombreCompleto: "Test User",
          password: "",
        } as never,
      );

      expect(result).toEqual(mockUsuario);
      expect(bcrypt.hash).toHaveBeenCalledWith("randomPass123", 12);
      expect(db.insert).toHaveBeenCalled();
    });

    it("debería enviar email de bienvenida después de crear usuario", async () => {
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUsuario]),
        }),
      });

      await createUsuario(
        db as never,
        {
          email: "user@muni.cl",
          nombreCompleto: "Test User",
          password: "",
        } as never,
      );

      // sendWelcomeEmail is called in background (fire-and-forget)
      // Wait for the microtask queue to flush
      await new Promise((r) => setTimeout(r, 10));

      expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
        db,
        "user@muni.cl",
        "Test User",
        1,
        "randomPass123",
      );
    });

    it("debería lanzar error si la inserción falla (email duplicado)", async () => {
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockRejectedValue(
              new Error("duplicate key value violates unique constraint"),
            ),
        }),
      });

      await expect(
        createUsuario(
          db as never,
          {
            email: "duplicate@muni.cl",
            nombreCompleto: "Dup User",
            password: "",
          } as never,
        ),
      ).rejects.toThrow("Error al crear el usuario");
    });
  });

  // ─── updateUsuario() ──────────────────────────────────────────────────

  describe("updateUsuario()", () => {
    it("debería actualizar campos parciales del usuario", async () => {
      const updated = { ...mockUsuario, nombreCompleto: "Updated Name" };
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      });

      const result = await updateUsuario(db as never, 1, {
        nombreCompleto: "Updated Name",
      });

      expect(result.nombreCompleto).toBe("Updated Name");
    });

    it("debería hashear la contraseña si se incluye en la actualización", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUsuario]),
          }),
        }),
      });

      await updateUsuario(db as never, 1, { password: "newPassword123" });

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 12);
    });

    it("debería lanzar error si el update falla", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockRejectedValue(new Error("duplicate key value")),
          }),
        }),
      });

      await expect(
        updateUsuario(db as never, 1, { email: "dup@muni.cl" }),
      ).rejects.toThrow("Error al actualizar el usuario");
    });
  });

  // ─── getAllUsuarios() ──────────────────────────────────────────────────

  describe("getAllUsuarios()", () => {
    it("debería retornar todos los usuarios sin campos sensibles", async () => {
      db.query.usuarios.findMany.mockResolvedValue([mockUsuario]);

      const result = await getAllUsuarios(db as never);
      expect(result).toEqual([mockUsuario]);
      // Verifica que se usan columnas excluidas (soft delete + campos sensibles)
      expect(db.query.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ columns: expect.any(Object) }),
      );
    });
  });

  // ─── getUsuarioById() ─────────────────────────────────────────────────

  describe("getUsuarioById()", () => {
    it("debería retornar un usuario por ID (solo activos)", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUsuario]),
        }),
      });

      const result = await getUsuarioById(db as never, 1);
      expect(result).toEqual(mockUsuario);
    });
  });

  // ─── deleteUsuario() ──────────────────────────────────────────────────

  describe("deleteUsuario()", () => {
    it("debería hacer soft delete de un usuario y retornar el registro", async () => {
      // Soft delete usa db.update() en vez de db.delete()
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUsuario]),
          }),
        }),
      });

      const result = await deleteUsuario(db as never, 1);
      expect(result).toEqual(mockUsuario);
      // Verifica que se usó update (soft delete) no delete (hard delete)
      expect(db.update).toHaveBeenCalled();
      expect(db.delete).not.toHaveBeenCalled();
    });
  });
});
