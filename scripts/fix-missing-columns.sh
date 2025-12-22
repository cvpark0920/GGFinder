#!/bin/sh
# 누락된 컬럼 자동 추가 스크립트

echo "🔄 Checking for missing columns..."

# DATABASE_URL에서 연결 정보 추출
DATABASE_URL="${DATABASE_URL:-postgresql://app:app@db:5432/ggfinder?schema=public&sslmode=disable}"

# FavoriteDirection enum 생성
echo "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FavoriteDirection') THEN CREATE TYPE \"FavoriteDirection\" AS ENUM ('groom_to_bride', 'bride_to_groom'); END IF; END \$\$;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# FavoriteStatus enum 생성
echo "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FavoriteStatus') THEN CREATE TYPE \"FavoriteStatus\" AS ENUM ('pending', 'accepted', 'rejected'); END IF; END \$\$;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# direction 컬럼 확인 및 추가
echo "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"direction\" \"FavoriteDirection\" NOT NULL DEFAULT 'groom_to_bride';" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# status 컬럼 확인 및 추가
echo "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"status\" \"FavoriteStatus\" NOT NULL DEFAULT 'pending';" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# updatedAt 컬럼 확인 및 추가
echo "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# fromClientId 컬럼 확인 및 추가
echo "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"fromClientId\" INTEGER;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# 인덱스 생성
echo "CREATE INDEX IF NOT EXISTS \"favorites_fromClientId_idx\" ON \"favorites\"(\"fromClientId\");" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

echo "CREATE INDEX IF NOT EXISTS \"favorites_direction_status_idx\" ON \"favorites\"(\"direction\", \"status\");" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

echo "CREATE INDEX IF NOT EXISTS \"favorites_status_idx\" ON \"favorites\"(\"status\");" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

# avatarUrl 컬럼 확인 및 추가
echo "ALTER TABLE \"clients\" ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT;" | \
  npx prisma@6.1.0 db execute --stdin 2>/dev/null || true

echo "✅ Missing columns check completed"

