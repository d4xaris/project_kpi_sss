# ── Stage 1: install all deps ─────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
<<<<<<< HEAD
COPY package.json package-lock.json ./
=======
COPY backend/package.json backend/package-lock.json ./
>>>>>>> b6db2c15176ef699217740a203f672b85ded176d
RUN npm ci --legacy-peer-deps

# ── Stage 2: generate Prisma client + compile TypeScript ──────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 3: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
<<<<<<< HEAD
COPY package.json package-lock.json ./
=======
COPY backend/package.json backend/package-lock.json ./
>>>>>>> b6db2c15176ef699217740a203f672b85ded176d
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated ./src/generated

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
