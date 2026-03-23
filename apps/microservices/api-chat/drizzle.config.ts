import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config()

export default defineConfig({
  schema: '../../../packages/db-mensajeria/src/schemas/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_TRANSVERSAL ?? '',
  },
  schemaFilter: ['mensajeria'],
  verbose: true,
  strict: true,
})
