#!/bin/bash
# 데이터베이스 자격 증명 문제 해결 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 데이터베이스 자격 증명 문제 해결"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 현재 .env 파일 확인
echo "1. 현재 .env 파일의 데이터베이스 설정 확인..."
if [ -f ".env" ]; then
  POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 || echo "app")
  POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 || echo "")
  POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 || echo "ggfinder")
  
  echo "   POSTGRES_USER: ${POSTGRES_USER}"
  echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:0:5}*** (길이: ${#POSTGRES_PASSWORD})"
  echo "   POSTGRES_DB: ${POSTGRES_DB}"
else
  echo "❌ .env 파일을 찾을 수 없습니다."
  exit 1
fi
echo ""

# 2. 데이터베이스 컨테이너 상태 확인
echo "2. 데이터베이스 컨테이너 상태 확인..."
if docker compose ps db | grep -q "Up"; then
  echo "✅ 데이터베이스 컨테이너 실행 중"
else
  echo "❌ 데이터베이스 컨테이너가 실행되지 않음"
  echo "   컨테이너를 시작합니다..."
  docker compose up -d db
  sleep 5
fi
echo ""

# 3. 데이터베이스 연결 테스트
echo "3. 데이터베이스 연결 테스트..."
if docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ 데이터베이스 연결 성공"
  DB_PASSWORD_CORRECT=true
else
  echo "❌ 데이터베이스 연결 실패"
  DB_PASSWORD_CORRECT=false
  
  # 4. 데이터베이스 비밀번호 재설정 시도
  echo ""
  echo "4. 데이터베이스 비밀번호 재설정 시도..."
  
  # docker-compose.yml의 기본값 확인
  COMPOSE_PASSWORD=$(grep "POSTGRES_PASSWORD:" docker-compose.yml | head -1 | sed 's/.*POSTGRES_PASSWORD.*:-\([^}]*\)}/\1/' | tr -d ' ' || echo "")
  
  if [ -n "$COMPOSE_PASSWORD" ] && [ "$COMPOSE_PASSWORD" != "$POSTGRES_PASSWORD" ]; then
    echo "⚠️  docker-compose.yml의 기본값과 .env 파일의 비밀번호가 다릅니다."
    echo "   docker-compose.yml 기본값: ${COMPOSE_PASSWORD}"
    echo "   .env 파일 값: ${POSTGRES_PASSWORD:0:5}***"
    echo ""
    read -p ".env 파일의 비밀번호를 docker-compose.yml 기본값으로 변경하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # .env 파일 백업
      cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
      
      # POSTGRES_PASSWORD 업데이트
      if grep -q "^POSTGRES_PASSWORD=" .env; then
        sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${COMPOSE_PASSWORD}|g" .env
      else
        echo "POSTGRES_PASSWORD=${COMPOSE_PASSWORD}" >> .env
      fi
      
      # DATABASE_URL 업데이트
      NEW_DATABASE_URL="postgresql://${POSTGRES_USER}:${COMPOSE_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public&sslmode=disable"
      if grep -q "^DATABASE_URL=" .env; then
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${NEW_DATABASE_URL}|g" .env
      else
        echo "DATABASE_URL=${NEW_DATABASE_URL}" >> .env
      fi
      
      echo "✅ .env 파일 업데이트 완료"
      POSTGRES_PASSWORD="${COMPOSE_PASSWORD}"
    fi
  fi
  
  # 데이터베이스 컨테이너 재시작
  echo ""
  echo "5. 데이터베이스 컨테이너 재시작..."
  docker compose restart db
  sleep 5
  
  # 다시 연결 테스트
  if docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 재시작 후 데이터베이스 연결 성공"
    DB_PASSWORD_CORRECT=true
  else
    echo "❌ 여전히 연결 실패"
    echo ""
    echo "⚠️  데이터베이스 볼륨을 재생성해야 할 수 있습니다."
    echo "   주의: 이 작업은 모든 데이터를 삭제합니다!"
    read -p "데이터베이스 볼륨을 재생성하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "🔄 데이터베이스 볼륨 재생성 중..."
      docker compose down -v
      docker compose up -d db
      sleep 10
      
      # 마이그레이션 실행
      echo "🔄 마이그레이션 실행 중..."
      docker compose exec app npx prisma@6.1.0 migrate deploy
      
      echo "✅ 데이터베이스 재생성 완료"
    fi
  fi
fi
echo ""

# 6. 앱 컨테이너 재시작
if [ "$DB_PASSWORD_CORRECT" = true ]; then
  echo "6. 앱 컨테이너 재시작..."
  docker compose restart app
  sleep 5
  
  echo ""
  echo "7. 연결 확인..."
  if docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 최종 연결 확인 성공"
  else
    echo "❌ 최종 연결 확인 실패"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 명령어로 로그 확인:"
echo "  docker compose logs app --tail=50 | grep -i error"

