#!/bin/bash
# Docker 빌드 스크립트
# DigitalOcean App Platform에서 빌드 타임 환경 변수를 Docker ARG로 전달

set -e

echo "=== Docker Build Script ==="
echo "Building Docker image with build-time environment variables..."

# 빌드 타임 환경 변수 확인
echo "Environment variables:"
echo "  VITE_API_BASE_URL=${VITE_API_BASE_URL:-NOT_SET}"
echo "  VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-NOT_SET}"
echo "  GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-NOT_SET}"

# Docker 빌드 실행
docker build \
  --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-${_self.URL}}" \
  --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID}}" \
  -t app \
  -f Dockerfile \
  .

echo "✅ Docker build completed"

