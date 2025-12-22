#!/bin/sh
# 누락된 컬럼 자동 추가 스크립트

set -e

echo "🔄 Checking for missing columns..."

# 데이터베이스 연결 대기 (최대 30초)
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if npx prisma@6.1.0 db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection established"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo "⏳ Waiting for database connection... ($ATTEMPT/$MAX_ATTEMPTS)"
  sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "⚠️  Database connection timeout, but continuing..."
fi

# SQL 실행 헬퍼 함수
execute_sql() {
  local sql="$1"
  local description="$2"
  echo "  $description..."
  if echo "$sql" | npx prisma@6.1.0 db execute --stdin 2>&1; then
    echo "    ✅ Success"
  else
    echo "    ⚠️  Failed (may already exist)"
  fi
}

# FavoriteDirection enum 생성
execute_sql \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FavoriteDirection') THEN CREATE TYPE \"FavoriteDirection\" AS ENUM ('groom_to_bride', 'bride_to_groom'); END IF; END \$\$;" \
  "Creating FavoriteDirection enum"

# FavoriteStatus enum 생성
execute_sql \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FavoriteStatus') THEN CREATE TYPE \"FavoriteStatus\" AS ENUM ('pending', 'accepted', 'rejected'); END IF; END \$\$;" \
  "Creating FavoriteStatus enum"

# direction 컬럼 확인 및 추가
execute_sql \
  "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"direction\" \"FavoriteDirection\" NOT NULL DEFAULT 'groom_to_bride';" \
  "Adding direction column"

# status 컬럼 확인 및 추가
execute_sql \
  "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"status\" \"FavoriteStatus\" NOT NULL DEFAULT 'pending';" \
  "Adding status column"

# updatedAt 컬럼 확인 및 추가
execute_sql \
  "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;" \
  "Adding updatedAt column"

# fromClientId 컬럼 확인 및 추가
execute_sql \
  "ALTER TABLE \"favorites\" ADD COLUMN IF NOT EXISTS \"fromClientId\" INTEGER;" \
  "Adding fromClientId column"

# 인덱스 생성
execute_sql \
  "CREATE INDEX IF NOT EXISTS \"favorites_fromClientId_idx\" ON \"favorites\"(\"fromClientId\");" \
  "Creating fromClientId index"

execute_sql \
  "CREATE INDEX IF NOT EXISTS \"favorites_direction_status_idx\" ON \"favorites\"(\"direction\", \"status\");" \
  "Creating direction_status index"

execute_sql \
  "CREATE INDEX IF NOT EXISTS \"favorites_status_idx\" ON \"favorites\"(\"status\");" \
  "Creating status index"

# avatarUrl 컬럼 확인 및 추가
execute_sql \
  "ALTER TABLE \"clients\" ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT;" \
  "Adding avatarUrl column"

echo "✅ Missing columns check completed"

