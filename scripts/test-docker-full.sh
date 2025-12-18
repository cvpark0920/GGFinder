#!/bin/bash

# 전체 Docker 테스트 스크립트
# 이 스크립트는 docker-compose를 사용하여 전체 스택을 테스트합니다.

set -e

echo "=========================================="
echo "전체 Docker 스택 테스트 시작"
echo "=========================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# .env 파일 확인
if [ ! -f .env ]; then
    echo -e "${YELLOW}경고: .env 파일이 없습니다.${NC}"
    echo "기본값을 사용하여 테스트를 진행합니다."
    echo ""
    echo "다음 명령어로 .env 파일을 생성할 수 있습니다:"
    echo "  cp .env.example .env"
    echo "  # 그 다음 .env 파일을 편집하여 실제 값을 입력하세요"
    echo ""
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}.env 파일을 찾았습니다.${NC}"
fi

# 기존 컨테이너 정리
echo ""
echo -e "${BLUE}기존 컨테이너 정리 중...${NC}"
docker-compose down -v 2>/dev/null || true

# Docker 이미지 빌드
echo ""
echo -e "${BLUE}Docker 이미지 빌드 시작...${NC}"
if ! docker-compose build; then
    echo -e "${RED}❌ 빌드 실패!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 빌드 완료!${NC}"

# 컨테이너 시작
echo ""
echo -e "${BLUE}컨테이너 시작 중...${NC}"
docker-compose up -d

# 데이터베이스 연결 대기
echo ""
echo -e "${BLUE}데이터베이스 연결 대기 중...${NC}"
timeout=30
counter=0
while ! docker-compose exec -T db pg_isready -U app > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ 데이터베이스 연결 시간 초과!${NC}"
        docker-compose logs db
        docker-compose down
        exit 1
    fi
    echo -n "."
    sleep 1
    counter=$((counter + 1))
done
echo ""
echo -e "${GREEN}✅ 데이터베이스 연결 성공!${NC}"

# 애플리케이션 헬스 체크 대기
echo ""
echo -e "${BLUE}애플리케이션 헬스 체크 대기 중...${NC}"
timeout=60
counter=0
while ! curl -f http://localhost:4000/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ 헬스 체크 시간 초과!${NC}"
        echo ""
        echo "애플리케이션 로그:"
        docker-compose logs app
        docker-compose down
        exit 1
    fi
    echo -n "."
    sleep 2
    counter=$((counter + 2))
done
echo ""
echo -e "${GREEN}✅ 헬스 체크 성공!${NC}"

# 테스트 결과 출력
echo ""
echo "=========================================="
echo -e "${GREEN}✅ 전체 테스트 성공!${NC}"
echo "=========================================="
echo ""
echo "서비스 상태:"
docker-compose ps
echo ""
echo "애플리케이션 URL:"
echo "  - 프론트엔드: http://localhost:4000"
echo "  - 헬스 체크: http://localhost:4000/health"
echo ""
echo "로그 확인:"
echo "  docker-compose logs -f app"
echo ""
echo "컨테이너 중지:"
echo "  docker-compose down"
echo ""
echo "컨테이너 및 볼륨 완전 제거:"
echo "  docker-compose down -v"
echo ""

# 헬스 체크 상세 정보 출력
echo "헬스 체크 응답:"
curl -s http://localhost:4000/health | jq . 2>/dev/null || curl -s http://localhost:4000/health
echo ""

exit 0

