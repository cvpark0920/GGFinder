#!/bin/bash
# 롤백 스크립트 - DigitalOcean Droplet에서 실행

set -euo pipefail

APP_DIR="/app/ggfinder"
BACKUP_DIR="/app/ggfinder-backups"

if [ ! -d "${BACKUP_DIR}" ]; then
  echo "❌ Backup directory not found: ${BACKUP_DIR}"
  exit 1
fi

# 백업 목록 표시
echo "📋 Available backups:"
ls -lt ${BACKUP_DIR} | head -10

# 사용자 입력 받기
read -p "Enter backup timestamp to rollback (YYYYMMDD_HHMMSS): " TIMESTAMP

BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

if [ ! -d "${BACKUP_PATH}" ]; then
  echo "❌ Backup not found: ${BACKUP_PATH}"
  exit 1
fi

echo "🔄 Rolling back to: ${TIMESTAMP}"
cd ${APP_DIR}

# 현재 상태 백업 (롤백 실패 시 복구용)
CURRENT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "${BACKUP_DIR}/pre-rollback-${CURRENT_TIMESTAMP}"
cp -r docker-compose.yml .env* "${BACKUP_DIR}/pre-rollback-${CURRENT_TIMESTAMP}/" 2>/dev/null || true

# 컨테이너 중지
echo "🛑 Stopping current containers..."
docker compose down --timeout 30 || true

# 백업 복원
echo "📦 Restoring backup files..."
cp "${BACKUP_PATH}/docker-compose.yml" .
if [ -f "${BACKUP_PATH}/.env" ]; then
  cp "${BACKUP_PATH}/.env" .
fi

# 컨테이너 재시작
echo "🚀 Starting containers from backup..."
docker compose up -d

# 헬스체크 대기
echo "⏳ Waiting for health check..."
sleep 15

HEALTH_RESPONSE=$(curl -sf http://localhost:4000/health || echo "failed")
if echo "$HEALTH_RESPONSE" | grep -q "status.*ok\|healthy"; then
  echo "✅ Rollback successful!"
  docker compose ps
else
  echo "❌ Rollback may have issues. Please check logs:"
  docker compose logs --tail=50 app
  exit 1
fi

