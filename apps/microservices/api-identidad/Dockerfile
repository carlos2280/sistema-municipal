FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/db-identidad/package.json ./packages/db-identidad/
COPY apps/microservices/api-identidad/package.json ./apps/microservices/api-identidad/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/core/ ./packages/core/
COPY packages/db-identidad/ ./packages/db-identidad/
COPY apps/microservices/api-identidad/ ./apps/microservices/api-identidad/
RUN pnpm --filter @municipal/core build && \
    pnpm --filter @municipal/db-identidad build && \
    pnpm --filter api-identidad build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages/core/package.json ./packages/core/
COPY packages/db-identidad/package.json ./packages/db-identidad/
COPY apps/microservices/api-identidad/package.json ./apps/microservices/api-identidad/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/db-identidad/dist ./packages/db-identidad/dist
COPY --from=build /app/apps/microservices/api-identidad/dist ./apps/microservices/api-identidad/dist
WORKDIR /app/apps/microservices/api-identidad
EXPOSE 3001
CMD ["node", "dist/index.js"]
