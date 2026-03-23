FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_shell/package.json ./apps/microfrontends/mf_shell/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_shell/ ./apps/microfrontends/mf_shell/
RUN pnpm --filter mf-shell build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/microfrontends/mf_shell/package.json ./apps/microfrontends/mf_shell/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_shell/dist ./apps/microfrontends/mf_shell/dist
COPY --from=build /app/apps/microfrontends/mf_shell/server.js ./apps/microfrontends/mf_shell/server.js
WORKDIR /app/apps/microfrontends/mf_shell
EXPOSE 80
CMD ["node", "server.js"]
