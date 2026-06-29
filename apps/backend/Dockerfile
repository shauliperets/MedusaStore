# syntax=docker/dockerfile:1.6

# =========================
# 1. BUILDER
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# Cap Node heap to 1.5 GB — leaves headroom for OS + npm on a 4 GB server.
# Medusa admin build (Vite/esbuild) can spike past 2 GB without this.
ENV NODE_OPTIONS=--max-old-space-size=1536

COPY . .

RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --prefer-offline

RUN npm run build

# =========================
# 2. RUNNER (LEAN)
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.medusa/server/ .

RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --ignore-scripts --no-audit --no-fund --prefer-offline

ENV NODE_ENV=production
EXPOSE 9000
CMD ["sh", "-c", "node_modules/.bin/medusa db:migrate && node_modules/.bin/medusa start"]
