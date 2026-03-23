FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_mesa_ayuda/package.json ./apps/microfrontends/mf_mesa_ayuda/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_mesa_ayuda/ ./apps/microfrontends/mf_mesa_ayuda/
RUN pnpm --filter mf-mesa-ayuda build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_mesa_ayuda/package.json ./apps/microfrontends/mf_mesa_ayuda/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_mesa_ayuda/dist ./apps/microfrontends/mf_mesa_ayuda/dist
COPY --from=build /app/apps/microfrontends/mf_mesa_ayuda/server.js ./apps/microfrontends/mf_mesa_ayuda/server.js
WORKDIR /app/apps/microfrontends/mf_mesa_ayuda
EXPOSE 5050
CMD ["node", "server.js"]
