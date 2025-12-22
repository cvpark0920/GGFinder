#!/bin/bash
# 실패한 마이그레이션 자동 해결 스크립트

set -euo pipefail

echo "🔍 Checking for failed migrations..."

# Prisma migrate status로 실패한 마이그레이션 확인
MIGRATE_OUTPUT=$(npx prisma@6.1.0 migrate status 2>&1 || true)

# 실패한 마이그레이션 이름 추출
FAILED_MIGRATIONS=$(echo "$MIGRATE_OUTPUT" | grep -oP "The \`\K[^\`]+" || echo "")

if [ -z "$FAILED_MIGRATIONS" ]; then
  echo "✅ No failed migrations found"
  exit 0
fi

echo "⚠️  Found failed migrations:"
echo "$FAILED_MIGRATIONS"
echo ""

# 각 실패한 마이그레이션 해결 시도
for migration in $FAILED_MIGRATIONS; do
  echo "🔧 Attempting to resolve: $migration"
  
  # 먼저 적용된 것으로 표시 시도 (마이그레이션이 실제로 적용되었을 수 있음)
  if npx prisma@6.1.0 migrate resolve --applied "$migration" 2>/dev/null; then
    echo "  ✅ Resolved as applied: $migration"
    continue
  fi
  
  # 적용되지 않았다면 롤백된 것으로 표시
  if npx prisma@6.1.0 migrate resolve --rolled-back "$migration" 2>/dev/null; then
    echo "  ✅ Resolved as rolled-back: $migration"
    continue
  fi
  
  echo "  ❌ Could not resolve automatically: $migration"
  echo "  💡 Manual intervention may be required"
done

echo ""
echo "🔄 Running migrations..."
npx prisma@6.1.0 migrate deploy

echo "✅ Migration resolution completed"

