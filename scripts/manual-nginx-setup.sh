#!/bin/bash
# Nginx 및 SSL 수동 설정 스크립트 (Droplet에서 실행)

set -euo pipefail

DOMAIN="finder.ggacademy.top"
NGINX_CONFIG="/etc/nginx/sites-available/ggfinder"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Nginx 및 SSL 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Nginx 설치 확인
echo "1. Nginx 설치 확인..."
if ! command -v nginx &> /dev/null; then
  echo "Nginx 설치 중..."
  sudo apt update
  sudo apt install nginx -y
  echo "✅ Nginx 설치 완료"
else
  echo "✅ Nginx가 이미 설치되어 있습니다."
fi
echo ""

# 2. Nginx 설정 파일 생성
echo "2. Nginx 설정 파일 생성..."
sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    access_log /var/log/nginx/ggfinder_access.log;
    error_log /var/log/nginx/ggfinder_error.log;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }

    client_max_body_size 100M;
}
EOF

echo "✅ Nginx 설정 파일 생성 완료: $NGINX_CONFIG"
echo ""

# 3. 설정 파일 활성화
echo "3. 설정 파일 활성화..."
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/ggfinder

# 기본 설정 제거
if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm /etc/nginx/sites-enabled/default
  echo "✅ 기본 설정 제거 완료"
fi

# Nginx 설정 테스트
echo "Nginx 설정 테스트 중..."
if sudo nginx -t; then
  echo "✅ Nginx 설정 검증 성공"
  sudo systemctl reload nginx
  sudo systemctl enable nginx
else
  echo "❌ Nginx 설정 검증 실패"
  exit 1
fi
echo ""

# 4. Certbot 설치 확인
echo "4. Certbot 설치 확인..."
if ! command -v certbot &> /dev/null; then
  echo "Certbot 설치 중..."
  sudo apt install certbot python3-certbot-nginx -y
  echo "✅ Certbot 설치 완료"
else
  echo "✅ Certbot이 이미 설치되어 있습니다."
fi
echo ""

# 5. DNS 확인
echo "5. DNS 설정 확인..."
DROPLET_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "Droplet IP: $DROPLET_IP"
echo ""
DNS_IP=$(dig +short ${DOMAIN} | tail -1 || echo "")
if [ -n "$DNS_IP" ] && [ "$DNS_IP" = "$DROPLET_IP" ]; then
  echo "✅ DNS가 올바르게 설정되었습니다."
elif [ -n "$DNS_IP" ]; then
  echo "⚠️  DNS IP가 일치하지 않습니다."
  echo "   예상 IP: $DROPLET_IP"
  echo "   실제 IP: $DNS_IP"
else
  echo "⚠️  DNS 레코드를 찾을 수 없습니다."
fi
echo ""

# 6. SSL 인증서 발급
echo "6. SSL 인증서 발급..."
echo "Certbot을 실행합니다..."
echo ""

read -p "이메일 주소를 입력하세요 (선택사항, Enter로 건너뛰기): " EMAIL

if [ -n "$EMAIL" ]; then
  sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect
else
  sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email --redirect
fi

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SSL 인증서 발급 완료"
else
  echo ""
  echo "⚠️  SSL 인증서 발급 실패"
  echo "수동으로 실행하세요:"
  echo "  sudo certbot --nginx -d ${DOMAIN}"
fi
echo ""

# 7. 환경 변수 업데이트
echo "7. 애플리케이션 환경 변수 업데이트..."
cd /app/ggfinder 2>/dev/null || {
  echo "⚠️  /app/ggfinder 디렉토리를 찾을 수 없습니다."
  echo "수동으로 환경 변수를 업데이트하세요."
  exit 0
}

if [ -f .env ]; then
  # 환경 변수 백업
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
  
  # 환경 변수 업데이트
  if grep -q "VITE_API_BASE_URL=" .env; then
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://${DOMAIN}|g" .env
  else
    echo "VITE_API_BASE_URL=https://${DOMAIN}" >> .env
  fi
  
  if grep -q "CORS_ORIGIN=" .env; then
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://${DOMAIN}|g" .env
  else
    echo "CORS_ORIGIN=https://${DOMAIN}" >> .env
  fi
  
  if grep -q "FRONTEND_URL=" .env; then
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|g" .env
  else
    echo "FRONTEND_URL=https://${DOMAIN}" >> .env
  fi
  
  echo "✅ 환경 변수 업데이트 완료"
  echo ""
  echo "업데이트된 환경 변수:"
  grep -E "VITE_API_BASE_URL|CORS_ORIGIN|FRONTEND_URL" .env
  echo ""
  
  echo "컨테이너를 재시작하세요:"
  echo "  docker compose restart app"
else
  echo "⚠️  .env 파일을 찾을 수 없습니다."
  echo "수동으로 .env 파일을 생성하고 다음을 추가하세요:"
  echo "  VITE_API_BASE_URL=https://${DOMAIN}"
  echo "  CORS_ORIGIN=https://${DOMAIN}"
  echo "  FRONTEND_URL=https://${DOMAIN}"
fi
echo ""

# 8. 방화벽 설정
echo "8. 방화벽 설정..."
if command -v ufw &> /dev/null; then
  sudo ufw --force enable
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  echo "✅ 방화벽 설정 완료"
  sudo ufw status
else
  echo "⚠️  UFW가 설치되어 있지 않습니다."
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 설정 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. 컨테이너 재시작: docker compose restart app"
echo "  2. 브라우저에서 https://${DOMAIN} 접속 확인"
echo "  3. SSL 인증서 확인 (자물쇠 아이콘)"
echo ""

