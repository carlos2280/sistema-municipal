import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.VITE_PORT || 5021

app.use(cors())

app.use(
  express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript')
      }
    },
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mf_chat', port: PORT })
})

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`mf_chat server running on http://localhost:${PORT}`)
  console.log(`Remote Entry: http://localhost:${PORT}/remoteEntry.js`)
})
