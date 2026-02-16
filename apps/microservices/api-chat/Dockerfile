FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/shared/package.json ./packages/shared/
COPY apps/microservices/api-chat/package.json ./apps/microservices/api-chat/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/shared/ ./packages/shared/
COPY apps/microservices/api-chat/ ./apps/microservices/api-chat/
RUN pnpm --filter @municipal/shared build && pnpm --filter api-chat build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN echo "shamefully-hoist=true" > .npmrc
COPY packages/shared/package.json ./packages/shared/
COPY apps/microservices/api-chat/package.json ./apps/microservices/api-chat/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/microservices/api-chat/dist ./apps/microservices/api-chat/dist
WORKDIR /app/apps/microservices/api-chat
EXPOSE 3004
CMD ["node", "dist/index.js"]
