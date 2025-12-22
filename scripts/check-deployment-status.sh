#!/bin/bash
# 배포 상태 확인 스크립트 - Droplet에서 실행

set -euo pipefail

APP_DIR="/app/ggfinder"
cd ${APP_DIR}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 배포 상태 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 컨테이너 상태 확인
echo -e "${BLUE}📊 1. 컨테이너 상태${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps
echo ""

# 2. 컨테이너 재시작 횟수 확인
echo -e "${BLUE}🔄 2. 컨테이너 재시작 횟수${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Restarts}}" | head -5
echo ""

# 재시작 횟수가 많은 컨테이너 확인
RESTART_COUNT=$(docker compose ps --format "{{.Restarts}}" | grep -v "RESTARTS" | sort -rn | head -1)
if [ -n "$RESTART_COUNT" ] && [ "$RESTART_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  컨테이너가 재시작되고 있습니다. 재시작 횟수: ${RESTART_COUNT}${NC}"
  echo ""
fi

# 3. 최근 로그 확인 (앱 컨테이너)
echo -e "${BLUE}📋 3. 앱 컨테이너 최근 로그 (마지막 50줄)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose logs --tail=50 app 2>&1 | tail -50
echo ""

# 4. 에러 로그 확인
echo -e "${BLUE}❌ 4. 에러 로그 확인${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose logs app 2>&1 | grep -i "error\|failed\|exception\|fatal" | tail -20 || echo "에러 로그가 없습니다."
echo ""

# 5. 데이터베이스 연결 상태 확인
echo -e "${BLUE}🗄️  5. 데이터베이스 연결 상태${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose exec -T db pg_isready -U app 2>/dev/null; then
  echo -e "${GREEN}✅ 데이터베이스 연결 정상${NC}"
else
  echo -e "${RED}❌ 데이터베이스 연결 실패${NC}"
fi
echo ""

# 6. 헬스체크 확인
echo -e "${BLUE}🏥 6. 헬스체크 상태${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -sf http://localhost:4000/health 2>/dev/null || echo "failed")
if [ "$HEALTH_RESPONSE" != "failed" ]; then
  echo -e "${GREEN}✅ 헬스체크 응답:${NC}"
  echo "$HEALTH_RESPONSE" | head -10
else
  echo -e "${RED}❌ 헬스체크 실패 (서버가 응답하지 않음)${NC}"
fi
echo ""

# 7. 리소스 사용량 확인
echo -e "${BLUE}💻 7. 리소스 사용량${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -5
echo ""

# 8. 디스크 사용량 확인
echo -e "${BLUE}💾 8. 디스크 사용량${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h / | tail -1
echo ""

# 9. 마이그레이션 상태 확인
echo -e "${BLUE}🔄 9. 마이그레이션 상태${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose exec -T app npx prisma@6.1.0 migrate status 2>&1 | head -20; then
  echo ""
else
  echo -e "${YELLOW}⚠️  마이그레이션 상태 확인 실패${NC}"
fi
echo ""

# 10. 환경 변수 확인 (민감 정보 제외)
echo -e "${BLUE}🔐 10. 환경 변수 확인 (일부)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose exec -T app env | grep -E "NODE_ENV|PORT|DATABASE_URL" | sed 's/DATABASE_URL=.*/DATABASE_URL=***/' || echo "환경 변수 확인 실패"
echo ""

# 11. 문제 진단 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 문제 진단 요약${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 재시작 횟수 확인
if [ -n "$RESTART_COUNT" ] && [ "$RESTART_COUNT" -gt 5 ]; then
  echo -e "${RED}⚠️  컨테이너가 ${RESTART_COUNT}번 이상 재시작되었습니다.${NC}"
  echo ""
  echo "가능한 원인:"
  echo "1. 마이그레이션 실패"
  echo "2. 데이터베이스 연결 실패"
  echo "3. 메모리 부족"
  echo "4. 애플리케이션 크래시"
  echo ""
  echo "해결 방법:"
  echo "1. 로그 확인: docker compose logs -f app"
  echo "2. 마이그레이션 확인: docker compose exec app npx prisma migrate status"
  echo "3. 데이터베이스 확인: docker compose logs db"
  echo "4. 리소스 확인: docker stats"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 상태 확인 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

