declare global {
  namespace Express {
    interface Request {
      gatewayUser?: {
        id: number
        nombre: string
        email: string | undefined
        tenantId: number
      }
    }
  }
}

export {}
