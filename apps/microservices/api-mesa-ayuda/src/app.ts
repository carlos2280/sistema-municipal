import { loadEnv } from '@/config/env'
import { type DbClient, initializeDB } from '@/db/client'
import { errorHandler } from '@/libs/middleware/error.middleware'
import { requireGateway } from '@/libs/middleware/requireGateway'
import { extractUser } from '@/middlewares/extractUser'
import router from '@/routes'
import { requestIdMiddleware } from '@municipal/core/logger'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { sql } from 'drizzle-orm'
import express from 'express'

const env = loadEnv()
const db: DbClient = initializeDB(env)

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }),
)
app.use(requestIdMiddleware)
app.use(express.json())
app.use(cookieParser())
app.use(requireGateway)

// Extrae y valida usuario + tenantId desde headers del gateway.
// Mesa de ayuda es centralizada: siempre conecta a DB `transversal`.
// El tenantId del header se usa como filtro obligatorio en todas las queries.
app.use(extractUser)

app.use('/api', router)

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`)
    res.json({
      status: 'ok',
      service: 'api-mesa-ayuda',
      timestamp: new Date().toISOString(),
    })
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      service: 'api-mesa-ayuda',
      timestamp: new Date().toISOString(),
    })
  }
})

app.use(errorHandler)
export { db }
export default app
