#!/bin/bash
# 누락된 avatarUrl 컬럼 추가 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 누락된 avatarUrl 컬럼 추가"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /app/ggfinder || exit 1

# 컨테이너가 실행 중인지 확인
if ! docker compose ps | grep -q "ggfinder_app.*Up"; then
  echo "❌ 앱 컨테이너가 실행 중이 아닙니다."
  echo "   docker compose up -d 로 컨테이너를 시작하세요."
  exit 1
fi

# 방법 1: Prisma 마이그레이션으로 해결 시도
echo "📋 방법 1: Prisma 마이그레이션 상태 확인..."
MIGRATION_STATUS=$(docker compose exec -T app npx prisma migrate status 2>&1 || echo "error")

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
  echo "✅ 마이그레이션 상태: 최신"
else
  echo "⚠️  마이그레이션 상태:"
  echo "$MIGRATION_STATUS" | head -20
fi

# 방법 2: 직접 SQL로 컬럼 추가 시도
echo ""
echo "📋 방법 2: 직접 SQL로 컬럼 추가 시도..."

# 컬럼 존재 여부 확인
COLUMN_EXISTS=$(docker compose exec -T db psql -U app -d ggfinder -tAc \
  "SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clients' AND column_name='avatarUrl'
  );" 2>/dev/null || echo "false")

if [ "$COLUMN_EXISTS" = "t" ]; then
  echo "✅ avatarUrl 컬럼이 이미 존재합니다."
else
  echo "⚠️  avatarUrl 컬럼이 없습니다. 추가 중..."
  
  # 컬럼 추가
  docker compose exec -T db psql -U app -d ggfinder -c \
    "ALTER TABLE \"clients\" ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT;" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ avatarUrl 컬럼 추가 완료"
  else
    echo "❌ 컬럼 추가 실패"
    exit 1
  fi
fi

# 방법 3: Prisma 마이그레이션 재적용 시도
echo ""
echo "📋 방법 3: 마이그레이션 재적용 시도..."

# 특정 마이그레이션 해결 시도
docker compose exec -T app npx prisma migrate resolve --applied 20251216090000_add_avatar_url 2>&1 || true

# 마이그레이션 배포
echo "🔄 마이그레이션 배포 중..."
MIGRATE_OUTPUT=$(docker compose exec -T app npx prisma migrate deploy 2>&1)

if echo "$MIGRATE_OUTPUT" | grep -q "All migrations have been applied"; then
  echo "✅ 모든 마이그레이션이 적용되었습니다."
elif echo "$MIGRATE_OUTPUT" | grep -q "No pending migrations"; then
  echo "✅ 대기 중인 마이그레이션이 없습니다."
else
  echo "⚠️  마이그레이션 출력:"
  echo "$MIGRATE_OUTPUT" | tail -20
fi

# Prisma Client 재생성
echo ""
echo "📋 Prisma Client 재생성 중..."
docker compose exec -T app npx prisma generate 2>&1 | tail -5

# 앱 컨테이너 재시작
echo ""
echo "🔄 앱 컨테이너 재시작 중..."
docker compose restart app
sleep 5

# 최종 확인
echo ""
echo "🔍 최종 확인..."
FINAL_CHECK=$(docker compose exec -T db psql -U app -d ggfinder -tAc \
  "SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clients' AND column_name='avatarUrl'
  );" 2>/dev/null || echo "false")

if [ "$FINAL_CHECK" = "t" ]; then
  echo "✅ avatarUrl 컬럼 확인 완료"
else
  echo "❌ avatarUrl 컬럼이 여전히 없습니다."
  exit 1
fi

# 헬스체크 확인
echo ""
echo "🔍 헬스체크 확인..."
sleep 3
HEALTH_RESPONSE=$(curl -s http://localhost:4000/health 2>/dev/null || echo "{}")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  echo "✅ 헬스체크 성공"
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

