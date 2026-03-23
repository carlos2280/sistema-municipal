import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestIdMiddleware } from '../index'

describe('requestIdMiddleware', () => {
  const createMockReqRes = (
    headers: Record<string, string | undefined> = {},
  ) => {
    const req = { headers: { ...headers } }
    const res = { setHeader: vi.fn() }
    const next = vi.fn()
    return { req, res, next }
  }

  it('genera un request ID UUID si no viene en headers', () => {
    const { req, res, next } = createMockReqRes()

    requestIdMiddleware(req, res, next)

    const assignedId = req.headers['x-request-id'] as string
    expect(assignedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', assignedId)
    expect(next).toHaveBeenCalled()
  })

  it('reutiliza el request ID existente del header', () => {
    const { req, res, next } = createMockReqRes({
      'x-request-id': 'existing-id-999',
    })

    requestIdMiddleware(req, res, next)

    expect(req.headers['x-request-id']).toBe('existing-id-999')
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      'existing-id-999',
    )
  })

  it('siempre invoca next()', () => {
    const { req, res, next } = createMockReqRes()

    requestIdMiddleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})

describe('createLogger', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('crea un logger con el nombre del servicio', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { createLogger } = await import('../index')

    const logger = createLogger('api-test')

    // Pino loggers en producción escriben JSON; verificar que tiene los métodos estándar
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')

    vi.unstubAllEnvs()
  })
})
