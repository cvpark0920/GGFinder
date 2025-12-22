#!/bin/bash
# .env 파일 자동 생성 스크립트
# .env.example을 기반으로 .env 파일을 생성하거나 업데이트합니다

set -euo pipefail

ENV_EXAMPLE=".env.example"
ENV_FILE=".env"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 .env 파일 자동 생성"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# .env.example 파일 확인
if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "❌ $ENV_EXAMPLE 파일을 찾을 수 없습니다."
  exit 1
fi

# 기존 .env 파일이 있으면 백업
if [ -f "$ENV_FILE" ]; then
  BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
  echo "💾 기존 .env 파일 백업: $BACKUP_FILE"
  cp "$ENV_FILE" "$BACKUP_FILE"
fi

# .env.example을 기반으로 새 .env 파일 생성
echo "📝 $ENV_EXAMPLE을 기반으로 $ENV_FILE 생성 중..."

# .env.example의 내용을 읽어서 실제 값으로 교체
# GitHub Secrets가 있으면 사용하고, 없으면 .env.example의 기본값 사용
cat "$ENV_EXAMPLE" | while IFS= read -r line; do
  # 주석이나 빈 줄은 그대로 유지
  if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
    echo "$line"
    continue
  fi
  
  # 환경 변수 추출
  if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
    VAR_NAME="${BASH_REMATCH[1]// /}"
    DEFAULT_VALUE="${BASH_REMATCH[2]}"
    
    # GitHub Secrets에서 값 가져오기 (환경 변수로 전달된 경우)
    # 실제로는 이 스크립트가 GitHub Actions에서 실행될 때
    # 환경 변수로 전달된 값을 사용합니다
    if [ -n "${!VAR_NAME:-}" ]; then
      echo "${VAR_NAME}=${!VAR_NAME}"
    else
      echo "$line"
    fi
  else
    echo "$line"
  fi
done > "$ENV_FILE.tmp"

mv "$ENV_FILE.tmp" "$ENV_FILE"

# 파일 권한 설정 (보안)
chmod 600 "$ENV_FILE"

echo "✅ $ENV_FILE 파일 생성 완료"
echo ""
echo "📋 생성된 환경 변수:"
grep -v "^#" "$ENV_FILE" | grep -v "^$" | sed 's/=.*/=***/' || true
echo ""
echo "⚠️  주의: 민감한 정보는 GitHub Secrets에서 관리하세요"
echo ""

