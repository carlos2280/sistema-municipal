# ============================================
# API Gateway - Dockerfile Multi-stage
# ============================================
# Build: docker build -t municipal-api-gateway .
# Run:   docker run -p 3000:3000 municipal-api-gateway
# ============================================

# --------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile --prod=false

# --------------------------------------------
# Stage 2: Builder
# --------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build de la aplicación
RUN pnpm build

# --------------------------------------------
# Stage 3: Runner (Producción)
# --------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copiar archivos necesarios
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/index.js"]
