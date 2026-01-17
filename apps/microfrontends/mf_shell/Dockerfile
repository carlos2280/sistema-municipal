# ============================================
# MF Shell (Host) - Dockerfile Multi-stage
# ============================================
# Build: docker build -t municipal-mf-shell .
# Run:   docker run -p 5000:80 municipal-mf-shell
# ============================================

# --------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# --------------------------------------------
# Stage 2: Builder
# --------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build (Module Federation URLs)
ARG VITE_API_URL
ARG VITE_MF_STORE_URL
ARG VITE_MF_UI_URL
ARG VITE_MF_CONTABILIDAD_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MF_STORE_URL=$VITE_MF_STORE_URL
ENV VITE_MF_UI_URL=$VITE_MF_UI_URL
ENV VITE_MF_CONTABILIDAD_URL=$VITE_MF_CONTABILIDAD_URL

RUN pnpm build

# --------------------------------------------
# Stage 3: Nginx (Producción)
# --------------------------------------------
FROM nginx:alpine AS runner

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
