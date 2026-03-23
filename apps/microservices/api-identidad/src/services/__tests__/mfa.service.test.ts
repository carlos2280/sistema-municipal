import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2a$12$hashedCode'),
    compare: vi.fn(),
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ _eq: val })),
}))

vi.mock('@municipal/db-identidad', () => ({
  usuarios: { id: 'id', email: 'email' },
}))

vi.mock('@municipal/core', () => ({
  BCRYPT_ROUNDS: 12,
  generateBackupCodes: vi.fn(() => [
    'ABCDE-12345',
    'FGHIJ-67890',
    'KLMNO-11111',
    'PQRST-22222',
    'UVWXY-33333',
    'ZABCD-44444',
    'EFGHI-55555',
    'JKLMN-66666',
  ]),
}))

vi.mock('otplib', () => ({
  authenticator: {
    generateSecret: vi.fn(() => 'JBSWY3DPEHPK3PXP'),
    keyuri: vi.fn(
      () =>
        'otpauth://totp/Sistema%20Municipal:user@muni.cl?secret=JBSWY3DPEHPK3PXP',
    ),
    verify: vi.fn(),
  },
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockQR'),
  },
}))

vi.mock('@/libs/utils/crypto.utils', () => ({
  encryptSecret: vi.fn((s: string) => `encrypted_${s}`),
  decryptSecret: vi.fn((s: string) => s.replace('encrypted_', '')),
}))

vi.mock('@/config/env', () => ({
  getEnv: () => ({ MFA_ENCRYPTION_KEY: '0'.repeat(64) }),
  loadEnv: () => ({
    JWT_SECRET_TEMP: 'test-secret',
    MFA_ENCRYPTION_KEY: '0'.repeat(64),
  }),
}))

vi.mock('@/libs/middleware/AppError', () => {
  class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean
    constructor(message: string, statusCode = 500, isOperational = true) {
      super(message)
      this.statusCode = statusCode
      this.isOperational = isOperational
    }
  }
  return { AppError }
})

vi.mock('@/db/client', () => ({
  // not used directly, but needed for import resolution
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import { generateBackupCodes } from '@municipal/core'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import {
  enableMfa,
  getMfaStatus,
  setupMfa,
  verifyBackupCode,
  verifyMfaCode,
} from '../mfa.service'

// ─── Mock DB ─────────────────────────────────────────────────────────────────

interface MockDbClient {
  query: {
    usuarios: {
      findFirst: ReturnType<typeof vi.fn>
    }
  }
  update: ReturnType<typeof vi.fn>
}

function createMockDb(): MockDbClient {
  return {
    query: {
      usuarios: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }
}

const mockUser = {
  id: 1,
  email: 'user@muni.cl',
  mfaEnabled: false,
  mfaVerified: false,
  mfaSecret: null,
  mfaBackupCodes: null,
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('mfa.service', () => {
  let db: MockDbClient

  beforeEach(() => {
    vi.clearAllMocks()
    db = createMockDb()
  })

  // ─── setupMfa() ───────────────────────────────────────────────────────

  describe('setupMfa()', () => {
    it('debería generar secreto TOTP, QR y guardar secreto cifrado', async () => {
      db.query.usuarios.findFirst.mockResolvedValue(mockUser)

      const result = await setupMfa(db as never, 1, 'user@muni.cl')

      expect(result).toHaveProperty('secret', 'JBSWY3DPEHPK3PXP')
      expect(result).toHaveProperty('qrCodeDataUrl')
      expect(result).toHaveProperty('otpauthUrl')
      expect(result.qrCodeDataUrl).toContain('data:image/png;base64')
      expect(db.update).toHaveBeenCalled()
    })

    it('debería lanzar 409 si MFA ya está activo y verificado', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaVerified: true,
      })

      await expect(setupMfa(db as never, 1, 'user@muni.cl')).rejects.toThrow(
        'MFA ya está activo en esta cuenta.',
      )
    })

    it('debería lanzar 404 si el usuario no existe', async () => {
      db.query.usuarios.findFirst.mockResolvedValue(null)

      await expect(
        setupMfa(db as never, 999, 'noexiste@muni.cl'),
      ).rejects.toThrow('Usuario no encontrado')
    })
  })

  // ─── enableMfa() ──────────────────────────────────────────────────────

  describe('enableMfa()', () => {
    it('debería activar MFA y retornar backup codes con código TOTP válido', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaSecret: 'encrypted_JBSWY3DPEHPK3PXP',
      })
      vi.mocked(authenticator.verify).mockReturnValue(true)

      const result = await enableMfa(db as never, 1, '123456')

      expect(result.backupCodes).toHaveLength(8)
      expect(generateBackupCodes).toHaveBeenCalled()
      expect(db.update).toHaveBeenCalled()
    })

    it('debería lanzar error con código TOTP inválido', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaSecret: 'encrypted_JBSWY3DPEHPK3PXP',
      })
      vi.mocked(authenticator.verify).mockReturnValue(false)

      await expect(enableMfa(db as never, 1, '000000')).rejects.toThrow(
        'Código incorrecto',
      )
    })

    it('debería lanzar error si no hay secreto MFA configurado', async () => {
      db.query.usuarios.findFirst.mockResolvedValue(mockUser)

      await expect(enableMfa(db as never, 1, '123456')).rejects.toThrow(
        'No se encontró secreto MFA',
      )
    })
  })

  // ─── verifyMfaCode() ──────────────────────────────────────────────────

  describe('verifyMfaCode()', () => {
    it('debería verificar código TOTP válido sin error', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'encrypted_secret',
      })
      vi.mocked(authenticator.verify).mockReturnValue(true)

      await expect(
        verifyMfaCode(db as never, 1, '123456'),
      ).resolves.toBeUndefined()
    })

    it('debería lanzar 401 con código TOTP inválido', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'encrypted_secret',
      })
      vi.mocked(authenticator.verify).mockReturnValue(false)

      await expect(verifyMfaCode(db as never, 1, '000000')).rejects.toThrow(
        'Código MFA inválido.',
      )
    })

    it('debería lanzar error si MFA no está habilitado', async () => {
      db.query.usuarios.findFirst.mockResolvedValue(mockUser)

      await expect(verifyMfaCode(db as never, 1, '123456')).rejects.toThrow(
        'MFA no está habilitado',
      )
    })
  })

  // ─── verifyBackupCode() ───────────────────────────────────────────────

  describe('verifyBackupCode()', () => {
    it('debería consumir backup code válido y eliminarlo', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaBackupCodes: ['$2a$12$hash1', '$2a$12$hash2'],
      })
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      await expect(
        verifyBackupCode(db as never, 1, 'ABCDE-12345'),
      ).resolves.toBeUndefined()

      // Should update DB removing the used code
      expect(db.update).toHaveBeenCalled()
    })

    it('debería lanzar error si no quedan códigos de respaldo', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaBackupCodes: [],
      })

      await expect(
        verifyBackupCode(db as never, 1, 'ABCDE-12345'),
      ).rejects.toThrow('No quedan códigos de respaldo')
    })
  })

  // ─── getMfaStatus() ───────────────────────────────────────────────────

  describe('getMfaStatus()', () => {
    it('debería retornar el estado MFA del usuario', async () => {
      db.query.usuarios.findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
        mfaVerified: true,
      })

      const result = await getMfaStatus(db as never, 1)

      expect(result).toEqual({
        mfaEnabled: true,
        mfaVerified: true,
      })
    })
  })
})
