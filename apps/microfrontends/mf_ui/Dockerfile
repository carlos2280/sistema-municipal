FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_ui/package.json ./apps/microfrontends/mf_ui/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_ui/ ./apps/microfrontends/mf_ui/
RUN pnpm --filter mf-ui build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_ui/package.json ./apps/microfrontends/mf_ui/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_ui/dist ./apps/microfrontends/mf_ui/dist
COPY --from=build /app/apps/microfrontends/mf_ui/server.js ./apps/microfrontends/mf_ui/server.js
WORKDIR /app/apps/microfrontends/mf_ui
EXPOSE 5011
CMD ["node", "server.js"]
