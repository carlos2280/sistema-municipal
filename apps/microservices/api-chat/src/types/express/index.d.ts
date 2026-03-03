import type { DbClient } from '../../db/client.js'

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: {
      id: number
      email: string
    }
    tenantDb?: DbClient
  }
}
