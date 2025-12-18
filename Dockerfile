# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment variables
# DigitalOcean App Platform은 BUILD_TIME scope 환경 변수를 빌드 환경에 설정함
# Dockerfile에서 빌드 시 환경 변수를 직접 읽어서 .env 파일 생성
# 주의: ARG는 --build-arg로 전달되지 않으면 undefined가 되므로,
# RUN 단계에서 빌드 환경의 환경 변수를 직접 읽어야 함

# 빌드 시 .env 파일 생성 (Vite가 빌드 시 읽음)
# 빌드 환경의 환경 변수를 직접 읽어서 사용
# DigitalOcean은 BUILD_TIME 환경 변수를 빌드 환경에 설정하므로,
# RUN 단계에서 $VITE_API_BASE_URL을 직접 참조 가능
RUN echo "=== Creating .env file for Vite build ===" && \
    echo "=== Checking build environment variables ===" && \
    env | grep VITE || echo "No VITE_* variables found in build environment" && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}" > .env && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}" >> .env && \
    echo "=== Created .env file contents ===" && \
    cat .env && \
    echo "==========================================" && \
    if [ -z "${VITE_API_BASE_URL:-}" ] || [ "${VITE_API_BASE_URL:-}" = "http://localhost:4000" ]; then \
      echo "⚠️ WARNING: VITE_API_BASE_URL is not set or using default!"; \
      echo "⚠️ Please ensure VITE_API_BASE_URL is set as BUILD_TIME environment variable in DigitalOcean"; \
    fi && \
    if [ -z "${VITE_GOOGLE_CLIENT_ID:-}" ]; then \
      echo "⚠️ WARNING: VITE_GOOGLE_CLIENT_ID is not set!"; \
      echo "⚠️ Please ensure VITE_GOOGLE_CLIENT_ID is set as BUILD_TIME SECRET in DigitalOcean"; \
    fi

# ENV로 설정 (빌드 시 사용)
# 빌드 환경의 환경 변수를 직접 참조
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}

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
# Use ; instead of && to allow server to start even if migrations fail
CMD ["sh", "-c", "npx prisma@6.1.0 migrate deploy; node server/dist/index.js"]

