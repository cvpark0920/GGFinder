#!/bin/sh
# 누락된 컬럼 자동 추가 스크립트

echo "🔄 Checking for missing columns..."

# DATABASE_URL에서 연결 정보 추출
DATABASE_URL="${DATABASE_URL:-postgresql://app:app@db:5432/ggfinder?schema=public&sslmode=disable}"

# fromClientId 컬럼 확인 및 추가
echo "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"fromClientId\" INTEGER;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

echo "CREATE INDEX IF NOT EXISTS \"favorites_fromClientId_idx\" ON \"favorites\"(\"fromClientId\");" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# avatarUrl 컬럼 확인 및 추가
echo "ALTER TABLE \"clients\" ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

echo "✅ Missing columns check completed"

