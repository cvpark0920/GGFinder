#!/bin/bash
# 배포 전 체크리스트 스크립트

set -e

echo "🔍 배포 전 체크리스트 확인 중..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Git 상태 확인
echo -e "${BLUE}📦 1. Git 상태 확인${NC}"
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain)
    if [ -z "$UNCOMMITTED" ]; then
        echo -e "${GREEN}✅ 커밋되지 않은 변경사항 없음${NC}"
    else
        echo -e "${YELLOW}⚠️  커밋되지 않은 변경사항이 있습니다:${NC}"
        git status --short | head -10
        WARNINGS=$((WARNINGS + 1))
    fi
    
    CURRENT_BRANCH=$(git branch --show-current)
    echo "현재 브랜치: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠️  현재 브랜치가 'main'이 아닙니다${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Git 저장소가 아닙니다${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. TypeScript 컴파일 확인
echo -e "${BLUE}🔨 2. TypeScript 컴파일 확인${NC}"
if npm run build:server > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 서버 빌드 성공${NC}"
else
    echo -e "${RED}❌ 서버 빌드 실패${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. 로컬 테스트 실행
echo -e "${BLUE}🧪 3. 로컬 테스트 실행${NC}"
echo "로컬 Docker 환경이 실행 중인지 확인 중..."
if docker compose ps | grep -q "ggfinder_app.*Up"; then
    echo -e "${GREEN}✅ 로컬 Docker 환경 실행 중${NC}"
    echo "로컬 테스트를 실행하시겠습니까? (y/n)"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        npm run test:local
    fi
else
    echo -e "${YELLOW}⚠️  로컬 Docker 환경이 실행되지 않았습니다${NC}"
    echo "로컬 테스트를 실행하려면: npm run docker:dev"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 4. 환경 변수 확인
echo -e "${BLUE}🔐 4. 환경 변수 확인${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production 파일 존재${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production 파일이 없습니다${NC}"
    echo "생성하려면: npm run setup:env:production"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 5. 린터 오류 확인
echo -e "${BLUE}📝 5. 코드 품질 확인${NC}"
echo "TypeScript 타입 체크 중..."
if npm run build:server > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 타입 오류 없음${NC}"
else
    echo -e "${RED}❌ 타입 오류 발견${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 체크리스트 요약${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 체크 통과! 배포 준비 완료${NC}"
    echo ""
    echo "다음 단계:"
    echo "1. git add ."
    echo "2. git commit -m 'your message'"
    echo "3. git push origin main"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  경고: $WARNINGS 개${NC}"
    echo ""
    echo "경고가 있지만 배포는 가능합니다."
    exit 0
else
    echo -e "${RED}❌ 오류: $ERRORS 개, 경고: $WARNINGS 개${NC}"
    echo ""
    echo "오류를 수정한 후 다시 시도하세요."
    exit 1
fi

