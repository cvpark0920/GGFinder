#!/bin/bash
# 로컬 개발 환경 설정 파일 생성 스크립트

set -e

echo "🔧 로컬 개발 환경 설정 파일 생성 중..."

cat > .env.local << 'EOF'
# 로컬 개발 환경 설정
# 이 파일은 로컬 Docker 테스트용입니다.

# Database (Docker 내부 네트워크 사용)
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=ggfinder
POSTGRES_PORT=5432
DATABASE_URL=postgresql://app:app@db:5432/ggfinder?schema=public&sslmode=disable

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
JWT_SECRET=A7G8iGOtWaCXr409gKct6bdi0O69SMvyuGrDoXZNFg4=

# 로컬 개발 환경 URL 설정
VITE_API_BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:4000
FRONTEND_URL=http://localhost:4000
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# 빌드 설정
BUILD_VALIDATE_ENV=false
NODE_ENV=development
PORT=4000
EOF

echo "✅ .env.local 파일이 생성되었습니다."
echo ""
echo "다음 명령어로 로컬 개발 환경을 시작하세요:"
echo "  npm run docker:dev"

