#!/bin/bash
# localhost를 HTTPS 도메인으로 자동 교체하는 스크립트

set -euo pipefail

ENV_FILE=".env"
BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
DOMAIN="https://finder.ggacademy.top"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 환경 변수 자동 수정 스크립트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# .env 파일 확인
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env 파일을 찾을 수 없습니다."
  exit 1
fi

# 백업
echo "💾 백업 생성: $BACKUP_FILE"
cp "$ENV_FILE" "$BACKUP_FILE"

# localhost를 HTTPS 도메인으로 교체
echo "🔄 localhost를 HTTPS 도메인으로 교체 중..."
sed -i "s|http://localhost:4000|${DOMAIN}|g" "$ENV_FILE"
sed -i "s|http://152.42.193.71:4000|${DOMAIN}|g" "$ENV_FILE"

# GOOGLE_REDIRECT_URI 확인 및 수정
if grep -q "GOOGLE_REDIRECT_URI=http://localhost" "$ENV_FILE"; then
  echo "🔄 GOOGLE_REDIRECT_URI 수정 중..."
  sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${DOMAIN}/api/auth/google/callback|g" "$ENV_FILE"
fi

# VITE_API_BASE_URL 확인 및 수정
if grep -q "VITE_API_BASE_URL=http://localhost" "$ENV_FILE"; then
  echo "🔄 VITE_API_BASE_URL 수정 중..."
  sed -i "s|VITE_API_BASE_URL=http://localhost|VITE_API_BASE_URL=${DOMAIN}|g" "$ENV_FILE"
fi

echo ""
echo "✅ 환경 변수 수정 완료"
echo ""
echo "📋 수정된 환경 변수:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN|VITE_API_BASE_URL" "$ENV_FILE" || echo "  (해당 변수가 없습니다)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 변경사항 확인
if diff -q "$BACKUP_FILE" "$ENV_FILE" > /dev/null; then
  echo "⚠️  변경사항이 없습니다."
else
  echo "📝 변경사항:"
  diff "$BACKUP_FILE" "$ENV_FILE" | grep "^<\|^>" | head -20 || true
  echo ""
  
  # 컨테이너 재시작 확인
  read -p "컨테이너를 재시작하시겠습니까? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 컨테이너 재시작 중..."
    docker compose restart app
    echo "✅ 컨테이너 재시작 완료"
    echo ""
    echo "📋 로그 확인 (5초 후):"
    sleep 5
    docker compose logs app --tail=50 | grep -A 10 "Google OAuth Config" || echo "  (로그를 찾을 수 없습니다)"
  else
    echo "⚠️  컨테이너를 수동으로 재시작하세요:"
    echo "   docker compose restart app"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

