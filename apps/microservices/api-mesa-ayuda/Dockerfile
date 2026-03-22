FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-platform/package.json ./packages/db-platform/
COPY packages/db-mesa-ayuda/package.json ./packages/db-mesa-ayuda/
COPY apps/microservices/api-mesa-ayuda/package.json ./apps/microservices/api-mesa-ayuda/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/core/ ./packages/core/
COPY packages/db-platform/ ./packages/db-platform/
COPY packages/db-mesa-ayuda/ ./packages/db-mesa-ayuda/
COPY apps/microservices/api-mesa-ayuda/ ./apps/microservices/api-mesa-ayuda/
RUN pnpm --filter @municipal/core build && \
    pnpm --filter @municipal/db-platform build && \
    pnpm --filter @municipal/db-mesa-ayuda build && \
    pnpm --filter api-mesa-ayuda build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/core/package.json ./packages/core/
COPY packages/db-platform/package.json ./packages/db-platform/
COPY packages/db-mesa-ayuda/package.json ./packages/db-mesa-ayuda/
COPY apps/microservices/api-mesa-ayuda/package.json ./apps/microservices/api-mesa-ayuda/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/db-platform/dist ./packages/db-platform/dist
COPY --from=build /app/packages/db-mesa-ayuda/dist ./packages/db-mesa-ayuda/dist
COPY --from=build /app/apps/microservices/api-mesa-ayuda/dist ./apps/microservices/api-mesa-ayuda/dist
WORKDIR /app/apps/microservices/api-mesa-ayuda
EXPOSE 4050
CMD ["node", "dist/index.js"]
