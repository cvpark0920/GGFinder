# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Generate Prisma Client (explicitly use Prisma 6.1.0 from package-lock.json)
RUN npx prisma@6.1.0 generate

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Build server
RUN npm run build:server

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/server/dist ./server/dist

# Generate Prisma Client for production (explicitly use Prisma 6.1.0)
RUN npm install prisma@6.1.0 --save-dev && npx prisma@6.1.0 generate

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Run migrations and start server (explicitly use Prisma 6.1.0)
CMD ["sh", "-c", "npx prisma@6.1.0 migrate deploy && node server/dist/index.js"]

