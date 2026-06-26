# syntax=docker/dockerfile:1.6

# =========================
# 1. BASE (shared cache)
# =========================
FROM node:20 AS base
WORKDIR /app

# enable corepack (faster package handling)
RUN corepack enable

# =========================
# 2. BUILDER
# =========================
FROM base AS builder

# Turbo cache env (local + optional remote)
ENV TURBO_TELEMETRY_DISABLED=1
ENV TURBO_CACHE_DIR=.turbo

# install turbo once
RUN npm install -g turbo

# copy only manifests first (max cache efficiency)
COPY package*.json ./
COPY turbo.json ./
COPY apps ./apps

# ⚡ BuildKit cache for npm (CRITICAL)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ⚡ Turbo remote cache support (optional but powerful)
# אם אין לך Vercel remote cache – זה עדיין עובד local cache
RUN --mount=type=cache,target=/app/.turbo \
    npx turbo run build --filter=@dtc/backend


# =========================
# 3. RUNTIME (LEAN)
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# copy ONLY compiled output
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json

# install ONLY production deps (no dev, no build tools)
RUN npm ci --omit=dev --ignore-scripts

ENV NODE_ENV=production

EXPOSE 9000

CMD ["node", "dist/main.js"]