#!/bin/bash
# 데이터베이스 연결 확인 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 데이터베이스 연결 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 데이터베이스 컨테이너 상태 확인
echo "1. 데이터베이스 컨테이너 상태 확인..."
if docker compose ps db | grep -q "Up"; then
  echo "✅ 데이터베이스 컨테이너 실행 중"
else
  echo "❌ 데이터베이스 컨테이너가 실행되지 않음"
  exit 1
fi
echo ""

# 2. 데이터베이스 연결 테스트
echo "2. 데이터베이스 연결 테스트..."
if docker compose exec -T db psql -U app -d ggfinder -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ 데이터베이스 연결 성공"
else
  echo "❌ 데이터베이스 연결 실패"
  exit 1
fi
echo ""

# 3. YouTubeVideo 테이블 확인
echo "3. YouTubeVideo 테이블 확인..."
TABLE_EXISTS=$(docker compose exec -T db psql -U app -d ggfinder -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'YouTubeVideo');" 2>/dev/null || echo "false")
if [ "$TABLE_EXISTS" = "t" ]; then
  echo "✅ YouTubeVideo 테이블 존재"
  ROW_COUNT=$(docker compose exec -T db psql -U app -d ggfinder -tAc "SELECT COUNT(*) FROM \"YouTubeVideo\";" 2>/dev/null || echo "0")
  echo "   행 개수: $ROW_COUNT"
else
  echo "❌ YouTubeVideo 테이블이 존재하지 않음"
  echo "   마이그레이션이 실행되지 않았을 수 있습니다."
fi
echo ""

# 4. Prisma 마이그레이션 상태 확인
echo "4. Prisma 마이그레이션 상태 확인..."
docker compose exec app npx prisma@6.1.0 migrate status 2>&1 | head -20
echo ""

# 5. 환경 변수 확인
echo "5. 데이터베이스 환경 변수 확인..."
echo "DATABASE_URL: $(docker compose exec app env | grep DATABASE_URL | cut -d'=' -f2- | sed 's/:[^:]*@/:***@/')"
echo ""

# 6. API 엔드포인트 테스트
echo "6. API 엔드포인트 테스트..."
API_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:4000/api/youtube/public 2>&1 || echo -e "\n000")
HTTP_CODE=$(echo "$API_RESPONSE" | tail -1)
BODY=$(echo "$API_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API 엔드포인트 정상 작동"
  echo "   응답: $(echo "$BODY" | head -c 100)..."
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ API 엔드포인트 500 에러"
  echo "   응답: $(echo "$BODY" | head -c 200)..."
elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ API 엔드포인트 연결 실패"
else
  echo "⚠️  API 엔드포인트 HTTP $HTTP_CODE"
  echo "   응답: $(echo "$BODY" | head -c 200)..."
fi
echo ""

# 7. 앱 컨테이너 로그 확인 (최근 에러)
echo "7. 최근 에러 로그 확인..."
ERROR_LOG=$(docker compose logs app --tail=50 | grep -i "error\|fail\|exception" | tail -5 || echo "에러 없음")
if [ "$ERROR_LOG" != "에러 없음" ]; then
  echo "⚠️  최근 에러 발견:"
  echo "$ERROR_LOG"
else
  echo "✅ 최근 에러 없음"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 진단 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

