#!/bin/bash
# 프로덕션 환경 설정 파일 생성 스크립트

set -e

echo "🔧 프로덕션 환경 설정 파일 생성 중..."

cat > .env.production << 'EOF'
# 프로덕션 환경 설정
# 이 파일은 프로덕션 배포용입니다. (GitHub Secrets에서 관리)

# Database (프로덕션 DB 사용)
# DATABASE_URL은 배포 시 GitHub Secrets에서 설정됩니다.

# Google OAuth Configuration
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET은 GitHub Secrets에서 설정됩니다.

# 프로덕션 URL 설정
VITE_API_BASE_URL=https://finder.ggacademy.top
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback

# 빌드 설정
BUILD_VALIDATE_ENV=false
NODE_ENV=production
PORT=4000

# JWT_SECRET은 GitHub Secrets에서 설정됩니다.
EOF

echo "✅ .env.production 파일이 생성되었습니다."
echo ""
echo "⚠️  주의: 프로덕션 환경 변수는 GitHub Secrets에서 관리됩니다."
echo "이 파일은 참고용입니다."

