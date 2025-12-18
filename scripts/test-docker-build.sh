#!/bin/bash

# Docker 빌드 테스트 스크립트
# 이 스크립트는 Docker 이미지가 올바르게 빌드되는지 테스트합니다.

set -e

echo "=========================================="
echo "Docker 빌드 테스트 시작"
echo "=========================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# .env 파일 확인
if [ ! -f .env ]; then
    echo -e "${YELLOW}경고: .env 파일이 없습니다. .env.example을 참고하여 생성하세요.${NC}"
    echo "기본값을 사용하여 빌드를 진행합니다."
    export VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}
else
    echo -e "${GREEN}.env 파일을 찾았습니다.${NC}"
    # .env 파일에서 환경 변수 로드
    export $(grep -v '^#' .env | xargs)
fi

# 빌드 타임 환경 변수 설정
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}

echo ""
echo "빌드 설정:"
echo "  - VITE_API_BASE_URL: ${VITE_API_BASE_URL}"
echo ""

# 기존 이미지 제거 (선택사항)
read -p "기존 빌드 이미지를 제거하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "기존 이미지 제거 중..."
    docker rmi ggfinder_app 2>/dev/null || true
    docker rmi $(docker images -q --filter "dangling=true") 2>/dev/null || true
fi

echo ""
echo "Docker 이미지 빌드 시작..."
echo ""

# Docker 빌드 실행
if docker build \
    --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
    -t ggfinder:test \
    -f Dockerfile \
    .; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ Docker 빌드 성공!"
    echo "==========================================${NC}"
    echo ""
    echo "빌드된 이미지 정보:"
    docker images ggfinder:test
    echo ""
    echo "다음 명령어로 이미지를 실행할 수 있습니다:"
    echo "  docker run -p 4000:4000 --env-file .env ggfinder:test"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}=========================================="
    echo "❌ Docker 빌드 실패!"
    echo "==========================================${NC}"
    echo ""
    echo "빌드 로그를 확인하세요."
    exit 1
fi

