import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'apps/microservices/api-autorizacion/vitest.config.ts',
  'apps/microservices/api-identidad/vitest.config.ts',
  'apps/microservices/api-gateway/vitest.config.ts',
  'packages/core/vitest.config.ts',
])
