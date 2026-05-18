# ── Stage 1: install all deps (including dev) ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: generate Prisma client + compile TypeScript ─────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 3: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Production deps only (must come before COPY from build stages)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Compiled JS output
COPY --from=build /app/dist ./dist

# Prisma migrations (needed by migrate deploy at startup)
COPY --from=build /app/prisma ./prisma

# Generated Prisma client
COPY --from=build /app/src/generated ./src/generated

ENV NODE_ENV=production

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
