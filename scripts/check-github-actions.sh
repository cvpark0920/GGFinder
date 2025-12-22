#!/bin/bash
# GitHub Actions 상태 확인 스크립트 (로컬에서 실행)

set -euo pipefail

REPO="cvpark0920/GGFinder"
WORKFLOW_NAME="Deploy to DigitalOcean Droplet"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 GitHub Actions 배포 상태 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# GitHub CLI 확인
if ! command -v gh &> /dev/null; then
  echo "⚠️  GitHub CLI (gh)가 설치되어 있지 않습니다."
  echo ""
  echo "설치 방법:"
  echo "  macOS: brew install gh"
  echo "  Linux: https://cli.github.com/"
  echo ""
  echo "또는 브라우저에서 직접 확인:"
  echo "  https://github.com/${REPO}/actions"
  echo ""
  exit 1
fi

# GitHub 인증 확인
if ! gh auth status &> /dev/null; then
  echo "⚠️  GitHub에 로그인되어 있지 않습니다."
  echo "로그인: gh auth login"
  exit 1
fi

echo "📋 최근 배포 워크플로우 실행 상태:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 워크플로우 실행 목록 가져오기
gh run list --workflow="${WORKFLOW_NAME}" --repo "${REPO}" --limit 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최신 배포 상세 정보:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 최신 실행 정보 가져오기
LATEST_RUN=$(gh run list --workflow="${WORKFLOW_NAME}" --repo "${REPO}" --limit 1 --json databaseId,status,conclusion,headBranch,headSha,createdAt --jq '.[0]')

if [ -z "$LATEST_RUN" ] || [ "$LATEST_RUN" == "null" ]; then
  echo "❌ 배포 워크플로우 실행 기록이 없습니다."
  exit 1
fi

# 정보 파싱
STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion // "unknown"')
BRANCH=$(echo "$LATEST_RUN" | jq -r '.headBranch')
SHA=$(echo "$LATEST_RUN" | jq -r '.headSha')
CREATED=$(echo "$LATEST_RUN" | jq -r '.createdAt')
RUN_ID=$(echo "$LATEST_RUN" | jq -r '.databaseId')

echo "상태: $STATUS"
echo "결과: $CONCLUSION"
echo "브랜치: $BRANCH"
echo "커밋: ${SHA:0:7}"
echo "실행 시간: $CREATED"
echo ""

# 상태에 따른 메시지
if [ "$STATUS" == "completed" ]; then
  if [ "$CONCLUSION" == "success" ]; then
    echo "✅ 배포가 성공적으로 완료되었습니다!"
  else
    echo "❌ 배포가 실패했습니다."
    echo ""
    echo "로그 확인:"
    echo "  gh run view $RUN_ID --repo ${REPO} --log"
  fi
elif [ "$STATUS" == "in_progress" ] || [ "$STATUS" == "queued" ]; then
  echo "⏳ 배포가 진행 중입니다..."
  echo ""
  echo "실시간 로그 확인:"
  echo "  gh run watch $RUN_ID --repo ${REPO}"
else
  echo "⚠️  배포 상태: $STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 유용한 명령어:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "최신 실행 로그 보기:"
echo "  gh run view $RUN_ID --repo ${REPO} --log"
echo ""
echo "실시간 로그 보기 (진행 중인 경우):"
echo "  gh run watch $RUN_ID --repo ${REPO}"
echo ""
echo "브라우저에서 확인:"
echo "  https://github.com/${REPO}/actions/runs/$RUN_ID"
echo ""

