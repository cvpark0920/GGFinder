#!/bin/bash
# 배포 테스트 스크립트 - 로컬에서 실행하여 배포 준비 상태 확인

set -euo pipefail

echo "🧪 배포 테스트 시작..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 체크 함수
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    return 1
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. 필수 파일 확인
echo "📋 1. 필수 파일 확인"
if [ ! -f "Dockerfile" ]; then
    check_fail "Dockerfile이 없습니다"
    exit 1
fi
check_pass "Dockerfile 존재"

if [ ! -f "docker-compose.yml" ]; then
    check_fail "docker-compose.yml이 없습니다"
    exit 1
fi
check_pass "docker-compose.yml 존재"

if [ ! -f ".github/workflows/deploy.yml" ]; then
    check_fail "배포 워크플로우 파일이 없습니다"
    exit 1
fi
check_pass "배포 워크플로우 파일 존재"

echo ""

# 2. Docker 설치 확인
echo "🐳 2. Docker 환경 확인"
if ! command -v docker &> /dev/null; then
    check_fail "Docker가 설치되어 있지 않습니다"
    exit 1
fi
check_pass "Docker 설치됨"

if ! docker info &> /dev/null; then
    check_fail "Docker 데몬이 실행 중이 아닙니다"
    exit 1
fi
check_pass "Docker 데몬 실행 중"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    check_fail "Docker Compose가 설치되어 있지 않습니다"
    exit 1
fi
check_pass "Docker Compose 설치됨"

echo ""

# 3. GitHub Actions 워크플로우 문법 검증
echo "📝 3. GitHub Actions 워크플로우 문법 검증"
if command -v yamllint &> /dev/null; then
    if yamllint .github/workflows/deploy.yml &> /dev/null; then
        check_pass "워크플로우 YAML 문법 검증 통과"
    else
        check_warn "YAML 문법 검증 실패 (yamllint 필요)"
    fi
else
    check_warn "yamllint가 설치되어 있지 않아 YAML 문법 검증을 건너뜁니다"
fi

# 기본 YAML 구조 확인
if grep -q "name:" .github/workflows/deploy.yml && \
   grep -q "on:" .github/workflows/deploy.yml && \
   grep -q "jobs:" .github/workflows/deploy.yml; then
    check_pass "워크플로우 기본 구조 확인"
else
    check_fail "워크플로우 기본 구조가 올바르지 않습니다"
    exit 1
fi

echo ""

# 4. Docker 이미지 빌드 테스트
echo "🔨 4. Docker 이미지 빌드 테스트"
echo "   (이 단계는 시간이 걸릴 수 있습니다...)"

# 빌드 인자 설정
export VITE_API_BASE_URL="http://localhost:4000"
export VITE_GOOGLE_CLIENT_ID="test-client-id"
export BUILD_VALIDATE_ENV="false"

if docker compose build --no-cache 2>&1 | tee /tmp/docker-build.log; then
    check_pass "Docker 이미지 빌드 성공"
else
    check_fail "Docker 이미지 빌드 실패"
    echo "빌드 로그:"
    tail -50 /tmp/docker-build.log
    exit 1
fi

echo ""

# 5. 필수 환경 변수 확인
echo "🔐 5. 환경 변수 확인"
REQUIRED_VARS=(
    "DROPLET_IP"
    "SSH_USERNAME"
    "SSH_PRIVATE_KEY"
    "JWT_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    check_pass "모든 필수 환경 변수가 설정되어 있습니다"
else
    check_warn "다음 환경 변수가 설정되지 않았습니다: ${MISSING_VARS[*]}"
    echo "   (GitHub Secrets에 설정되어 있어야 합니다)"
fi

echo ""

# 6. Git 상태 확인
echo "📦 6. Git 상태 확인"
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    check_pass "현재 브랜치: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        check_warn "현재 브랜치가 'main'이 아닙니다. 배포는 'main' 브랜치에만 실행됩니다."
    fi
    
    UNCOMMITTED=$(git status --porcelain)
    if [ -z "$UNCOMMITTED" ]; then
        check_pass "커밋되지 않은 변경사항 없음"
    else
        check_warn "커밋되지 않은 변경사항이 있습니다"
        echo "   변경된 파일:"
        git status --short | head -5
    fi
else
    check_warn "Git 저장소가 아닙니다"
fi

echo ""

# 7. 배포 스크립트 확인
echo "📜 7. 배포 스크립트 확인"
if [ -f "scripts/rollback-deployment.sh" ]; then
    if [ -x "scripts/rollback-deployment.sh" ]; then
        check_pass "롤백 스크립트 존재 및 실행 가능"
    else
        check_warn "롤백 스크립트가 실행 가능하지 않습니다"
        echo "   실행: chmod +x scripts/rollback-deployment.sh"
    fi
else
    check_warn "롤백 스크립트가 없습니다"
fi

echo ""

# 8. 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 요약"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 기본 검증 완료"
echo ""
echo "다음 단계:"
echo "1. GitHub 저장소의 Settings > Secrets and variables > Actions에서"
echo "   필수 Secrets를 설정하세요:"
echo "   - DROPLET_IP"
echo "   - SSH_USERNAME"
echo "   - SSH_PRIVATE_KEY"
echo "   - JWT_SECRET"
echo "   - GOOGLE_CLIENT_ID (선택)"
echo "   - GOOGLE_CLIENT_SECRET (선택)"
echo "   - POSTGRES_PASSWORD (선택)"
echo ""
echo "2. GitHub Actions에서 'Deploy to DigitalOcean Droplet' 워크플로우를"
echo "   수동으로 실행하거나 main 브랜치에 push하세요."
echo ""
echo "3. 배포 후 확인:"
echo "   curl http://<DROPLET_IP>:4000/health"
echo ""

