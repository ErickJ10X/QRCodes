FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies (full, needed for build)
COPY package*.json ./
RUN npm install

# Copy sources and Prisma schema/config
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Generate Prisma Client in the builder so the produced node_modules contains the client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN npm run build

# Remove dev dependencies to reduce final image size
RUN npm prune --production

FROM node:24-alpine AS runner

WORKDIR /app

# Copy runtime artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
