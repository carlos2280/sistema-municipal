import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.string().default('3004'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  CORS_ORIGIN: z.string().default('http://localhost:5030'),
  MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_DIR: z.string().default('./uploads'),
  LIVEKIT_URL: z.string().default('ws://localhost:7880'),
  LIVEKIT_API_KEY: z.string().default(''),
  LIVEKIT_API_SECRET: z.string().default(''),
  PLATFORM_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Variables de entorno inválidas:')
    console.error(result.error.format())
    process.exit(1)
  }

  return result.data
}
