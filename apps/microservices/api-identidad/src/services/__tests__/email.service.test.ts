import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
    })),
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn(),
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

vi.mock('@municipal/db-identidad', () => ({
  tokensContrasenaTemporal: { token: 'token' },
}))

vi.mock('@/config/env', () => ({
  loadEnv: () => ({
    JWT_SECRET_TEMP: 'test-secret',
    MFA_ENCRYPTION_KEY: '0'.repeat(64),
  }),
  getEnv: () => ({ MFA_ENCRYPTION_KEY: '0'.repeat(64) }),
}))

vi.mock('@/libs/utils/jwt.tokenTemoral', () => ({
  generarTokenTemporal: vi.fn(() => 'temp-jwt-token'),
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import { sendWelcomeEmail } from '../email.service'

// ─── Mock DB ─────────────────────────────────────────────────────────────────

const mockDb = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockResolvedValue(undefined),
  }),
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('email.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = ''
  })

  it('debería enviar email de bienvenida exitosamente', async () => {
    const result = await sendWelcomeEmail(
      mockDb as never,
      'user@muni.cl',
      'Test User',
      1,
      'tempPass123',
    )

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('test-msg-id')
  })

  it('NO debería incluir contraseña en texto plano en el texto alternativo', async () => {
    // This test verifies security: plaintext password MUST NOT leak in text body
    const nodemailer = await import('nodemailer')
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'id-1' })
    vi.mocked(nodemailer.default.createTransport).mockReturnValue({
      sendMail: mockSendMail,
    } as never)

    await sendWelcomeEmail(
      mockDb as never,
      'user@muni.cl',
      'Test User',
      1,
      'secretPassword123',
    )

    const sentArgs = mockSendMail.mock.calls[0]?.[0] as
      | {
          text?: string
        }
      | undefined

    // The text body should NOT contain the password
    if (sentArgs?.text) {
      expect(sentArgs.text).not.toContain('secretPassword123')
    }
  })

  it('debería retornar error gracefully si el envío falla', async () => {
    const nodemailer = await import('nodemailer')
    vi.mocked(nodemailer.default.createTransport).mockReturnValue({
      sendMail: vi.fn().mockRejectedValue(new Error('SMTP connection refused')),
    } as never)

    const result = await sendWelcomeEmail(
      mockDb as never,
      'user@muni.cl',
      'Test User',
      1,
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('SMTP connection refused')
  })
})
