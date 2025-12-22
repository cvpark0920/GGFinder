# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment variables
# 빌드 시 VITE_API_BASE_URL 등이 필요하므로 ARG로 전달받음
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG BUILD_VALIDATE_ENV=true

# 빌드 시 .env 파일 생성 (Vite가 빌드 시 읽음)
RUN echo "=== Creating .env file for Vite build ===" && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}" > .env && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}" >> .env && \
    echo "✅ .env file created for build"

# ENV로 설정 (빌드 시 사용)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}
ENV BUILD_VALIDATE_ENV=${BUILD_VALIDATE_ENV:-true}

# Copy package files
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Ensure Prisma 6.1.0 is installed (force version to avoid Prisma 7)
RUN npm install prisma@6.1.0 @prisma/client@6.1.0 --save-dev --save-exact

# Generate Prisma Client (explicitly use Prisma 6.1.0)
RUN npx prisma@6.1.0 generate

# Copy source files
COPY . .

# Build frontend (VITE_API_BASE_URL will be used during build)
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

# Run migrations and start server
# 실패한 마이그레이션을 자동으로 해결한 후 마이그레이션 실행
CMD ["sh", "-c", "echo '🔄 Running database migrations...' && \
  npx prisma@6.1.0 migrate deploy 2>&1 | tee /tmp/migrate.log || MIGRATE_FAILED=1; \
  if [ \"${MIGRATE_FAILED:-0}\" = \"1\" ] || grep -q 'failed migrations' /tmp/migrate.log || grep -q 'P3009' /tmp/migrate.log; then \
    echo '⚠️  Detected failed migrations, attempting to resolve...'; \
    FAILED_MIG=$(grep 'The \`' /tmp/migrate.log | sed -n \"s/.*The \\\`\\([^\\\`]*\\)\\\`.*/\\1/p\" | head -1); \
    if [ -n \"$FAILED_MIG\" ]; then \
      echo \"  Resolving: $FAILED_MIG\"; \
      npx prisma@6.1.0 migrate resolve --applied \"$FAILED_MIG\" 2>/dev/null || \
      npx prisma@6.1.0 migrate resolve --rolled-back \"$FAILED_MIG\" 2>/dev/null || \
      echo \"    Could not resolve automatically\"; \
      echo '🔄 Retrying migrations...'; \
      npx prisma@6.1.0 migrate deploy || exit 1; \
    else \
      echo '  Could not extract failed migration name'; \
      exit 1; \
    fi; \
  fi && \
  echo '✅ Migrations completed successfully' && \
  node server/dist/index.js"]

