declare namespace Express {
  interface Request {
    usuario?: {
      id: number
      email: string
    }
  }
}
