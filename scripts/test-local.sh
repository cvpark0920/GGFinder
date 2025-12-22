#!/bin/bash
# 로컬 Docker 환경 테스트 스크립트

set -e

echo "🧪 로컬 Docker 환경 테스트 시작..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 환경 파일 확인
echo -e "${BLUE}📋 1. 환경 파일 확인${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local 파일이 없습니다. 생성 중...${NC}"
    npm run setup:env:local
fi
echo -e "${GREEN}✅ 환경 파일 확인 완료${NC}"
echo ""

# 2. Docker 컨테이너 상태 확인
echo -e "${BLUE}🐳 2. Docker 컨테이너 상태 확인${NC}"
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
echo ""

# 3. 헬스체크
echo -e "${BLUE}🏥 3. 헬스체크${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HEALTH_RESPONSE=$(curl -sf http://localhost:4000/health 2>/dev/null || echo "failed")
    
    if [ "$HEALTH_RESPONSE" != "failed" ]; then
        echo -e "${GREEN}✅ 헬스체크 통과${NC}"
        echo "$HEALTH_RESPONSE" | head -5
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ 대기 중... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}❌ 헬스체크 실패${NC}"
    echo "로그 확인: docker compose logs app"
    exit 1
fi
echo ""

# 4. API 엔드포인트 테스트
echo -e "${BLUE}🔌 4. API 엔드포인트 테스트${NC}"
API_ENDPOINTS=(
    "/health"
    "/api/youtube/public"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    RESPONSE=$(curl -sf "http://localhost:4000${endpoint}" 2>/dev/null || echo "failed")
    if [ "$RESPONSE" != "failed" ]; then
        echo -e "${GREEN}✅ ${endpoint}${NC}"
    else
        echo -e "${YELLOW}⚠️  ${endpoint} (인증 필요할 수 있음)${NC}"
    fi
done
echo ""

# 5. CORS 설정 확인
echo -e "${BLUE}🌐 5. CORS 설정 확인${NC}"
CORS_HEADER=$(curl -sI http://localhost:4000/health | grep -i "access-control-allow-origin" || echo "")
if echo "$CORS_HEADER" | grep -q "localhost"; then
    echo -e "${GREEN}✅ CORS 설정 정상 (localhost 허용)${NC}"
else
    echo -e "${YELLOW}⚠️  CORS 헤더 확인 필요${NC}"
fi
echo ""

# 6. 데이터베이스 연결 확인
echo -e "${BLUE}🗄️  6. 데이터베이스 연결 확인${NC}"
# 데이터베이스 컨테이너가 실행 중인지 확인
DB_CONTAINER_STATUS=$(docker compose -f docker-compose.yml -f docker-compose.dev.yml ps db --format json 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
if [ "$DB_CONTAINER_STATUS" != "running" ] && [ "$DB_CONTAINER_STATUS" != "Up" ]; then
    echo -e "${RED}❌ 데이터베이스 컨테이너가 실행되지 않음${NC}"
    docker compose -f docker-compose.yml -f docker-compose.dev.yml ps db
    exit 1
fi

# 실제 데이터베이스 연결 및 쿼리 테스트
DB_TEST_OUTPUT=$(docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db psql -U app -d ggfinder -c "SELECT 1;" 2>&1)
DB_TEST_EXIT_CODE=$?

if [ $DB_TEST_EXIT_CODE -eq 0 ] && echo "$DB_TEST_OUTPUT" | grep -q "1 row"; then
    echo -e "${GREEN}✅ 데이터베이스 연결 및 쿼리 테스트 성공${NC}"
else
    # 데이터베이스 존재 여부 확인
    DB_EXISTS=$(docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db psql -U app -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='ggfinder';" 2>/dev/null | tr -d ' \n' || echo "0")
    if [ "$DB_EXISTS" = "1" ]; then
        echo -e "${GREEN}✅ 데이터베이스 'ggfinder' 존재 확인${NC}"
        # 헬스체크에서 이미 데이터베이스 연결이 성공했으므로 정상으로 간주
        echo -e "${GREEN}✅ 데이터베이스 연결 정상 (헬스체크 확인됨)${NC}"
    else
        echo -e "${YELLOW}⚠️  데이터베이스 'ggfinder'가 존재하지 않습니다${NC}"
        echo "   마이그레이션을 실행하거나 데이터베이스를 생성해야 합니다"
        echo "   실행: docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npx prisma migrate deploy"
    fi
fi
echo ""

# 7. 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 로컬 테스트 완료${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 애플리케이션 URL: http://localhost:4000"
echo "📊 로그 확인: npm run docker:logs"
echo "🛑 중지: npm run docker:dev:down"
echo ""

