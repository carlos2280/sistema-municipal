FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_chat/package.json ./apps/microfrontends/mf_chat/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY apps/microfrontends/mf_chat/ ./apps/microfrontends/mf_chat/
RUN pnpm --filter mf-chat build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production CI=true
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/microfrontends/mf_chat/package.json ./apps/microfrontends/mf_chat/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/microfrontends/mf_chat/dist ./apps/microfrontends/mf_chat/dist
COPY --from=build /app/apps/microfrontends/mf_chat/server.js ./apps/microfrontends/mf_chat/server.js
WORKDIR /app/apps/microfrontends/mf_chat
EXPOSE 5021
CMD ["node", "server.js"]
