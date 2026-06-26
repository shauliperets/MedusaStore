# =========================
# 1. BUILD STAGE
# =========================
FROM node:20 AS builder

WORKDIR /app

# install turbo globally
RUN npm install -g turbo

# copy root files first (for caching)
COPY package*.json ./
COPY turbo.json ./
COPY apps ./apps

# install dependencies (root level for monorepo)
RUN npm install

# build ONLY backend (important!)
RUN turbo build --filter=@dtc/backend

# =========================
# 2. RUNTIME STAGE
# =========================
FROM node:20-alpine

WORKDIR /app

# copy only backend build output
COPY --from=builder /app/apps/backend ./apps/backend

# install only production deps
WORKDIR /app/apps/backend
RUN npm install --omit=dev

EXPOSE 9000

CMD ["npm", "run", "start"]