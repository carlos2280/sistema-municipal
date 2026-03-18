FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-identidad/package.json ./packages/db-identidad/
COPY packages/db-platform/package.json ./packages/db-platform/
COPY apps/microservices/api-autorizacion/package.json ./apps/microservices/api-autorizacion/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/core/ ./packages/core/
COPY packages/db-identidad/ ./packages/db-identidad/
COPY packages/db-platform/ ./packages/db-platform/
COPY apps/microservices/api-autorizacion/ ./apps/microservices/api-autorizacion/
RUN pnpm --filter @municipal/core build && \
    pnpm --filter @municipal/db-identidad build && \
    pnpm --filter @municipal/db-platform build && \
    pnpm --filter api-autorizacion build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-identidad/package.json ./packages/db-identidad/
COPY packages/db-platform/package.json ./packages/db-platform/
COPY apps/microservices/api-autorizacion/package.json ./apps/microservices/api-autorizacion/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/db-identidad/dist ./packages/db-identidad/dist
COPY --from=build /app/packages/db-platform/dist ./packages/db-platform/dist
COPY --from=build /app/apps/microservices/api-autorizacion/dist ./apps/microservices/api-autorizacion/dist
WORKDIR /app/apps/microservices/api-autorizacion
EXPOSE 3003
CMD ["node", "dist/index.js"]
