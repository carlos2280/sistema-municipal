FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-contabilidad/package.json ./packages/db-contabilidad/
COPY apps/microservices/api-contabilidad/package.json ./apps/microservices/api-contabilidad/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/core/ ./packages/core/
COPY packages/db-contabilidad/ ./packages/db-contabilidad/
COPY apps/microservices/api-contabilidad/ ./apps/microservices/api-contabilidad/
RUN pnpm --filter @municipal/core build && \
    pnpm --filter @municipal/db-contabilidad build && \
    pnpm --filter api-contabilidad build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-contabilidad/package.json ./packages/db-contabilidad/
COPY apps/microservices/api-contabilidad/package.json ./apps/microservices/api-contabilidad/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/db-contabilidad/dist ./packages/db-contabilidad/dist
COPY --from=build /app/apps/microservices/api-contabilidad/dist ./apps/microservices/api-contabilidad/dist
WORKDIR /app/apps/microservices/api-contabilidad
EXPOSE 3002
CMD ["node", "dist/index.js"]
