FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_configuracion/package.json ./apps/microfrontends/mf_configuracion/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_configuracion/ ./apps/microfrontends/mf_configuracion/
RUN pnpm --filter mf-configuracion build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_configuracion/package.json ./apps/microfrontends/mf_configuracion/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_configuracion/dist ./apps/microfrontends/mf_configuracion/dist
COPY --from=build /app/apps/microfrontends/mf_configuracion/server.js ./apps/microfrontends/mf_configuracion/server.js
WORKDIR /app/apps/microfrontends/mf_configuracion
EXPOSE 5040
CMD ["node", "server.js"]
