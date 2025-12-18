# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment variables
# DigitalOcean App Platform은 BUILD_TIME scope 환경 변수를 빌드 환경에 설정하지만
# Docker ARG로 자동 전달하지 않으므로, 빌드 전에 .env 파일을 생성해야 함
# 또는 ARG로 전달받거나, 없으면 빌드 시 환경 변수에서 읽기 시도

# ARG 선언 (--build-arg로 전달되거나, 없으면 undefined)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

# 빌드 시 환경 변수에서 읽기 시도 (ARG가 없을 경우)
# 주의: Dockerfile에서는 빌드 환경의 환경 변수를 직접 읽을 수 없으므로
# build_command에서 --build-arg로 전달하거나 .env 파일을 생성해야 함
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# 빌드 시 환경 변수 확인 (디버깅용)
RUN echo "=== Build-time Environment Variables ===" && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-NOT_SET}" && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-NOT_SET}" && \
    echo "=========================================="

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

