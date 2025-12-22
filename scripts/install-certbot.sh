#!/bin/bash
# Certbot 설치 스크립트

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Certbot 설치"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 패키지 업데이트
echo "1. 패키지 업데이트 중..."
sudo apt update

# Certbot 설치
echo "2. Certbot 설치 중..."
sudo apt install certbot python3-certbot-nginx -y

# 설치 확인
if command -v certbot &> /dev/null; then
  echo ""
  echo "✅ Certbot 설치 완료"
  echo ""
  certbot --version
else
  echo "❌ Certbot 설치 실패"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 설치 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. Nginx 설정 완료 확인"
echo "  2. DNS 설정 확인"
echo "  3. SSL 인증서 발급: sudo certbot --nginx -d finder.ggacademy.top"
echo ""

