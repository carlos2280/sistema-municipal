import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './libs/middleware/error.middleware.js'
import { requireGateway } from './libs/middleware/requireGateway.js'
import { tenantDbMiddleware } from './middleware/tenantDb.js'
import apiRoutes from './routes/index.js'
import { requestIdMiddleware } from '@municipal/shared/logger'

const app = express()

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())
app.use(requestIdMiddleware)
app.use(cookieParser())
app.use(requireGateway)

// Middleware multi-tenant: inyecta req.tenantDb si llega x-tenant-db-name
app.use(tenantDbMiddleware)

// Health check
app.get('/health', async (_req, res) => {
  try {
    const { getRedisClient } = await import('./libs/redis.js')
    await getRedisClient().ping()
    res.json({ status: 'ok', service: 'api-chat', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'unhealthy', service: 'api-chat', timestamp: new Date().toISOString() })
  }
})

// API Routes
app.use('/api/chat', apiRoutes)

// Error handler
app.use(errorHandler)

export default app
