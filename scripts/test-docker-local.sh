#!/bin/bash
# 로컬 Docker 빌드 및 실행 테스트 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 로컬 Docker 빌드 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. 환경 변수 설정
echo -e "${BLUE}📋 1. 환경 변수 설정${NC}"
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}
export VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-test-client-id}
export BUILD_VALIDATE_ENV=${BUILD_VALIDATE_ENV:-false}

echo "  VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "  VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
echo "  BUILD_VALIDATE_ENV: $BUILD_VALIDATE_ENV"
echo ""

# 2. Docker 상태 확인
echo -e "${BLUE}🐳 2. Docker 상태 확인${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker가 실행 중이 아닙니다.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker 실행 중${NC}"
echo ""

# 3. 기존 컨테이너 정리 (선택사항)
echo -e "${BLUE}🧹 3. 기존 컨테이너 정리${NC}"
docker compose down 2>/dev/null || true
echo ""

# 4. Docker 빌드
echo -e "${BLUE}🔨 4. Docker 이미지 빌드${NC}"
echo "  (이 단계는 시간이 걸릴 수 있습니다...)"
echo ""

if docker compose build --no-cache app 2>&1 | tee /tmp/docker-build-local.log; then
  echo ""
  echo -e "${GREEN}✅ Docker 빌드 성공!${NC}"
else
  echo ""
  echo -e "${RED}❌ Docker 빌드 실패${NC}"
  echo ""
  echo "빌드 로그 확인:"
  tail -50 /tmp/docker-build-local.log
  exit 1
fi

echo ""

# 5. 빌드된 이미지 확인
echo -e "${BLUE}📦 5. 빌드된 이미지 정보${NC}"
docker images ggfinder-app --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo ""

# 6. 이미지 레이어 확인
echo -e "${BLUE}🔍 6. 이미지 레이어 확인${NC}"
IMAGE_SIZE=$(docker images ggfinder-app --format "{{.Size}}")
echo "  이미지 크기: $IMAGE_SIZE"
echo ""

# 7. CMD 확인
echo -e "${BLUE}⚙️  7. 컨테이너 시작 명령 확인${NC}"
CMD=$(docker inspect ggfinder-app:latest --format '{{.Config.Cmd}}' 2>/dev/null || echo "확인 불가")
echo "  CMD: $CMD"
echo ""

# 8. 선택적 실행 테스트
read -p "컨테이너를 실행하여 테스트하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}🚀 8. 컨테이너 실행 테스트${NC}"
  echo ""
  
  # 데이터베이스 없이 실행하면 마이그레이션에서 실패할 것이므로
  # 간단한 실행 테스트만 수행
  echo "  컨테이너 시작 테스트 (5초 후 종료)..."
  timeout 5 docker run --rm ggfinder-app:latest 2>&1 | head -20 || true
  echo ""
  echo -e "${GREEN}✅ 컨테이너 실행 테스트 완료${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 로컬 Docker 빌드 테스트 완료${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. 전체 스택 실행: docker compose up -d"
echo "  2. 로그 확인: docker compose logs -f"
echo "  3. 헬스체크: curl http://localhost:4000/health"
echo ""

