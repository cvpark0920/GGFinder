#!/bin/bash
# 컨테이너 진단 스크립트 - Droplet에서 실행

set -euo pipefail

APP_DIR="/app/ggfinder"
cd ${APP_DIR}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 컨테이너 상세 진단"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. 컨테이너 상태 확인
echo -e "${BLUE}📊 1. 컨테이너 상태${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps -a
echo ""

# 2. 앱 컨테이너 상세 정보
echo -e "${BLUE}📋 2. 앱 컨테이너 상세 정보${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps app | grep -q "Up\|Restarting\|Exited"; then
  docker compose ps app
  echo ""
  echo "컨테이너 ID:"
  docker compose ps -q app
else
  echo -e "${RED}❌ 앱 컨테이너가 실행되지 않았습니다.${NC}"
fi
echo ""

# 3. 전체 로그 확인 (최근 200줄)
echo -e "${BLUE}📜 3. 앱 컨테이너 전체 로그 (최근 200줄)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps -q app > /dev/null 2>&1; then
  docker compose logs app --tail=200 2>&1 || echo "로그를 가져올 수 없습니다."
else
  echo -e "${RED}❌ 컨테이너가 존재하지 않습니다.${NC}"
fi
echo ""

# 4. 에러 로그만 확인
echo -e "${BLUE}❌ 4. 에러 로그${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps -q app > /dev/null 2>&1; then
  docker compose logs app 2>&1 | grep -iE "error|failed|exception|fatal|crash" | tail -30 || echo "에러 로그가 없습니다."
else
  echo "컨테이너가 존재하지 않습니다."
fi
echo ""

# 5. 컨테이너 재시작 이력 확인
echo -e "${BLUE}🔄 5. 컨테이너 재시작 이력${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Restarts}}\t{{.State}}" | head -5
echo ""

# 6. 컨테이너가 재시작 중인지 확인
RESTARTING=$(docker compose ps app 2>/dev/null | grep -c "Restarting" || echo "0")
if [ "$RESTARTING" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  컨테이너가 재시작 중입니다!${NC}"
  echo ""
  echo "재시작 원인 확인:"
  docker inspect $(docker compose ps -q app) 2>/dev/null | grep -A 10 "State" || echo "상태 정보를 가져올 수 없습니다."
  echo ""
fi

# 7. 컨테이너 이벤트 확인
echo -e "${BLUE}📅 7. 최근 컨테이너 이벤트${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker events --since 10m --until now --filter container=$(docker compose ps -q app 2>/dev/null || echo "") 2>/dev/null | tail -20 || echo "이벤트가 없습니다."
echo ""

# 8. 컨테이너 내부 프로세스 확인 (실행 중인 경우)
echo -e "${BLUE}⚙️  8. 컨테이너 내부 프로세스${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps app | grep -q "Up"; then
  docker compose exec app ps aux 2>/dev/null || echo "프로세스 정보를 가져올 수 없습니다."
else
  echo "컨테이너가 실행 중이 아닙니다."
fi
echo ""

# 9. 환경 변수 확인 (민감 정보 제외)
echo -e "${BLUE}🔐 9. 환경 변수 확인${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps app | grep -q "Up"; then
  docker compose exec app env 2>/dev/null | grep -E "NODE_ENV|PORT|DATABASE_URL" | sed 's/DATABASE_URL=.*/DATABASE_URL=***/' || echo "환경 변수를 가져올 수 없습니다."
else
  echo "컨테이너가 실행 중이 아닙니다."
fi
echo ""

# 10. 데이터베이스 연결 확인
echo -e "${BLUE}🗄️  10. 데이터베이스 연결 확인${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps db | grep -q "Up"; then
  if docker compose exec -T db pg_isready -U app 2>/dev/null; then
    echo -e "${GREEN}✅ 데이터베이스 연결 정상${NC}"
  else
    echo -e "${RED}❌ 데이터베이스 연결 실패${NC}"
  fi
else
  echo -e "${RED}❌ 데이터베이스 컨테이너가 실행되지 않았습니다.${NC}"
fi
echo ""

# 11. 네트워크 연결 확인
echo -e "${BLUE}🌐 11. 네트워크 연결 확인${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps app | grep -q "Up"; then
  docker compose exec app ping -c 2 db 2>/dev/null || echo "네트워크 연결 확인 실패"
else
  echo "컨테이너가 실행 중이 아닙니다."
fi
echo ""

# 12. 디스크 사용량 확인
echo -e "${BLUE}💾 12. 디스크 사용량${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h / | tail -1
echo ""
docker system df
echo ""

# 13. 문제 진단 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 진단 요약${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONTAINER_STATUS=$(docker compose ps app 2>/dev/null | tail -1 | awk '{print $1}')
if [ -z "$CONTAINER_STATUS" ] || [ "$CONTAINER_STATUS" == "NAME" ]; then
  echo -e "${RED}❌ 앱 컨테이너가 존재하지 않습니다.${NC}"
  echo ""
  echo "해결 방법:"
  echo "  docker compose up -d app"
elif echo "$CONTAINER_STATUS" | grep -q "Restarting"; then
  echo -e "${RED}⚠️  컨테이너가 계속 재시작되고 있습니다!${NC}"
  echo ""
  echo "가능한 원인:"
  echo "  1. 마이그레이션 실패"
  echo "  2. 데이터베이스 연결 실패"
  echo "  3. 환경 변수 누락"
  echo "  4. 애플리케이션 크래시"
  echo ""
  echo "해결 방법:"
  echo "  1. 로그 확인: docker compose logs app"
  echo "  2. 마이그레이션 확인: docker compose exec app npx prisma migrate status"
  echo "  3. 데이터베이스 확인: docker compose logs db"
elif echo "$CONTAINER_STATUS" | grep -q "Exited"; then
  echo -e "${RED}❌ 컨테이너가 종료되었습니다.${NC}"
  echo ""
  echo "종료 코드 확인:"
  docker inspect $(docker compose ps -q app) 2>/dev/null | grep -A 5 "State" || echo "상태 정보를 가져올 수 없습니다."
  echo ""
  echo "해결 방법:"
  echo "  docker compose up -d app"
  echo "  docker compose logs app"
elif echo "$CONTAINER_STATUS" | grep -q "Up"; then
  echo -e "${GREEN}✅ 컨테이너가 정상적으로 실행 중입니다.${NC}"
else
  echo -e "${YELLOW}⚠️  컨테이너 상태: ${CONTAINER_STATUS}${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 진단 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

