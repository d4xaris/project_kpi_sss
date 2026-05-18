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

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Compiled JS
COPY --from=build /app/dist ./dist

# Prisma: migrations + generated client (compiled into dist/generated)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src/generated ./src/generated

ENV NODE_ENV=production

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
