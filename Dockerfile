# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment variables
# DigitalOcean App Platform은 BUILD_TIME scope 환경 변수를 빌드 환경에 설정하지만,
# Dockerfile의 RUN 단계에서는 직접 접근할 수 없으므로,
# build_command에서 --build-arg로 전달받아야 함

# ARG 선언 (--build-arg로 전달됨)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG BUILD_VALIDATE_ENV=true

# 빌드 시 .env 파일 생성 (Vite가 빌드 시 읽음)
# ARG로 전달받은 값을 사용
# 주의: ARG는 빌드 시에만 사용 가능하며, RUN 단계에서 $ARG_NAME으로 참조
RUN echo "=== Creating .env file for Vite build ===" && \
    echo "=== Build arguments ===" && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-NOT_SET}" && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-NOT_SET}" && \
    echo "==========================================" && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}" > .env && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}" >> .env && \
    echo "=== Created .env file contents ===" && \
    cat .env && \
    echo "==========================================" && \
    echo "=== Verifying .env file ===" && \
    if [ ! -f .env ]; then \
      echo "❌ ERROR: .env file was not created!"; \
      exit 1; \
    fi && \
    if [ -z "${VITE_API_BASE_URL:-}" ] || [ "${VITE_API_BASE_URL:-}" = "http://localhost:4000" ]; then \
      echo "⚠️ WARNING: VITE_API_BASE_URL is not set or using default!"; \
      echo "⚠️ Please ensure VITE_API_BASE_URL is set as BUILD_TIME environment variable in DigitalOcean"; \
    fi && \
    if [ -z "${VITE_GOOGLE_CLIENT_ID:-}" ]; then \
      echo "⚠️ WARNING: VITE_GOOGLE_CLIENT_ID is not set!"; \
      if [ "${BUILD_VALIDATE_ENV:-true}" = "true" ]; then \
        echo "❌ ERROR: VITE_GOOGLE_CLIENT_ID is required for production builds!"; \
        echo "❌ Please ensure VITE_GOOGLE_CLIENT_ID is set as BUILD_TIME SECRET in DigitalOcean"; \
        echo "❌ Or set BUILD_VALIDATE_ENV=false to skip validation (for CI/test builds)"; \
        exit 1; \
      else \
        echo "✅ BUILD_VALIDATE_ENV=false - skipping validation (CI/test build)"; \
        echo "⚠️ This build will use empty VITE_GOOGLE_CLIENT_ID - frontend may not work correctly"; \
      fi; \
    fi && \
    echo "✅ Environment variables verified successfully"

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

# Run migrations and start server (explicitly use Prisma 6.1.0)
# Resolve any previously failed migrations, then run all pending migrations
CMD ["sh", "-c", "echo '🔄 Resolving failed migrations...' && npx prisma@6.1.0 migrate resolve --applied 20251215234033_add_father_mother_age 2>/dev/null || echo '⚠️ Migration resolution skipped (may not exist)'; echo '🔄 Running database migrations...' && npx prisma@6.1.0 migrate deploy && echo '✅ Migrations completed successfully' && node server/dist/index.js"]

