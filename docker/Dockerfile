# =============================================================================
# Stage 1: Install ALL dependencies (dev + prod) for building
# =============================================================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# =============================================================================
# Stage 2: Install PRODUCTION-ONLY dependencies
# =============================================================================
FROM oven/bun:1-alpine AS prod-deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# =============================================================================
# Stage 3: Build the application
# =============================================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy full node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Generate Prisma client into src/generated/prisma
RUN bunx prisma generate --schema=./prisma/schema.prisma

# Build NestJS application
RUN bun run build

# =============================================================================
# Stage 4: Production runtime (minimal image)
# =============================================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copy production node_modules and compiled output
COPY --from=prod-deps --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nestjs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json

# Copy startup script
COPY --chown=nestjs:nestjs scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

ENV NODE_ENV=production

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["bun", "dist/main.js"]
