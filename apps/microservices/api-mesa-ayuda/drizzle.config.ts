import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config()

export default defineConfig({
  schema: '../../../packages/db-mesa-ayuda/src/schemas/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_TRANSVERSAL ?? '',
  },
  schemaFilter: ['mesa_ayuda'],
  verbose: true,
  strict: true,
})
