import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './libs/middleware/error.middleware.js'
import apiRoutes from './routes/index.js'

const app = express()

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-chat',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/chat', apiRoutes)

// Error handler
app.use(errorHandler)

export default app
