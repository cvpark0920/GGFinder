#!/bin/bash
# 데이터베이스 비밀번호 빠른 수정 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 데이터베이스 비밀번호 빠른 수정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /app/ggfinder || exit 1

# .env 파일 백업
if [ -f ".env" ]; then
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
  echo "💾 .env 파일 백업 완료"
fi

# docker-compose.yml에서 기본값 확인
COMPOSE_PASSWORD=$(grep "POSTGRES_PASSWORD:" docker-compose.yml | head -1 | sed -n "s/.*POSTGRES_PASSWORD.*:-\([^}]*\)}/\1/p" | tr -d ' ' || echo "app")
POSTGRES_USER="app"
POSTGRES_DB="ggfinder"

echo "📋 설정 확인:"
echo "   POSTGRES_USER: ${POSTGRES_USER}"
echo "   POSTGRES_PASSWORD: ${COMPOSE_PASSWORD}"
echo "   POSTGRES_DB: ${POSTGRES_DB}"
echo ""

# .env 파일 업데이트
echo "🔄 .env 파일 업데이트 중..."

# POSTGRES_PASSWORD 업데이트
if grep -q "^POSTGRES_PASSWORD=" .env; then
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${COMPOSE_PASSWORD}|g" .env
else
  echo "POSTGRES_PASSWORD=${COMPOSE_PASSWORD}" >> .env
fi

# DATABASE_URL 업데이트
NEW_DATABASE_URL="postgresql://${POSTGRES_USER}:${COMPOSE_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public&sslmode=disable"
if grep -q "^DATABASE_URL=" .env; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${NEW_DATABASE_URL}|g" .env
else
  echo "DATABASE_URL=${NEW_DATABASE_URL}" >> .env
fi

echo "✅ .env 파일 업데이트 완료"
echo ""

# 업데이트된 설정 확인
echo "📋 업데이트된 설정:"
grep -E "^POSTGRES_PASSWORD=|^DATABASE_URL=" .env | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/@.*:@/***@/'
echo ""

# 컨테이너 재시작
echo "🔄 컨테이너 재시작 중..."
docker compose restart db
echo "   데이터베이스 컨테이너 재시작 완료"
sleep 5

docker compose restart app
echo "   앱 컨테이너 재시작 완료"
sleep 5

# 연결 테스트
echo ""
echo "🔍 연결 테스트..."
if docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ 데이터베이스 연결 성공"
else
  echo "❌ 데이터베이스 연결 실패"
  echo ""
  echo "⚠️  데이터베이스 볼륨이 다른 비밀번호로 초기화되었을 수 있습니다."
  echo "   다음 중 하나를 선택하세요:"
  echo ""
  echo "   1. 데이터베이스 비밀번호 변경 (데이터 보존):"
  echo "      docker compose exec db psql -U postgres -c \"ALTER USER app WITH PASSWORD '${COMPOSE_PASSWORD}';\""
  echo ""
  echo "   2. 데이터베이스 볼륨 재생성 (데이터 삭제):"
  echo "      docker compose down -v"
  echo "      docker compose up -d db"
  echo "      sleep 10"
  echo "      docker compose exec app npx prisma@6.1.0 migrate deploy"
  exit 1
fi

# 헬스체크 확인
echo ""
echo "🔍 헬스체크 확인..."
sleep 3
HEALTH_RESPONSE=$(curl -s http://localhost:4000/health 2>/dev/null || echo "{}")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4 || echo "unknown")
  if [ "$DB_STATUS" = "connected" ]; then
    echo "✅ 헬스체크 성공 - 데이터베이스 연결됨"
  else
    echo "⚠️  헬스체크 응답: $HEALTH_RESPONSE"
  fi
else
  echo "⚠️  헬스체크 응답: $HEALTH_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "로그 확인:"
echo "  docker compose logs app --tail=50 | grep -i error"

