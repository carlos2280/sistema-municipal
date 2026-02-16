FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/microservices/api-autorizacion/package.json ./apps/microservices/api-autorizacion/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/shared/ ./packages/shared/
COPY apps/microservices/api-autorizacion/ ./apps/microservices/api-autorizacion/
RUN pnpm --filter @municipal/shared build && pnpm --filter api-autorizacion build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/microservices/api-autorizacion/package.json ./apps/microservices/api-autorizacion/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/microservices/api-autorizacion/dist ./apps/microservices/api-autorizacion/dist
WORKDIR /app/apps/microservices/api-autorizacion
EXPOSE 3003
CMD ["node", "dist/index.js"]
