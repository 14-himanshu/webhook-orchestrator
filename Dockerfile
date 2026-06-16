# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and build Next.js
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Development runner stage
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1


# Web runner stage (Next.js)
FROM base AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Copy generated prisma client if it's placed in src/generated
# (Removed because we now use standard @prisma/client)

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

# Worker runner stage (BullMQ Worker)
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production

# For the worker, we use tsx in production or build it. Since we have tsx installed, we can run it.
# A more optimized way is compiling, but for simplicity here we just use tsx from node_modules.
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN npx prisma generate

CMD ["npx", "tsx", "src/worker.ts"]
