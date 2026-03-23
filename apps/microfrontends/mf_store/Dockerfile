FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_store/package.json ./apps/microfrontends/mf_store/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_store/ ./apps/microfrontends/mf_store/
RUN pnpm --filter mf-store build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_store/package.json ./apps/microfrontends/mf_store/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_store/dist ./apps/microfrontends/mf_store/dist
COPY --from=build /app/apps/microfrontends/mf_store/server.js ./apps/microfrontends/mf_store/server.js
WORKDIR /app/apps/microfrontends/mf_store
EXPOSE 5010
CMD ["node", "server.js"]
