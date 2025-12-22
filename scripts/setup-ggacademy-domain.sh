#!/bin/bash
# ggacademy.top 도메인 설정 스크립트

set -euo pipefail

DOMAIN="ggacademy.top"
NGINX_CONFIG="/etc/nginx/sites-available/ggfinder"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ggacademy.top 도메인 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Droplet IP 확인
echo -e "${BLUE}1. Droplet IP 확인${NC}"
DROPLET_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "  Droplet IP: $DROPLET_IP"
echo ""
echo "⚠️  중요: 도메인 DNS 설정에서 다음 A 레코드를 추가하세요:"
echo "  - ggacademy.top → $DROPLET_IP"
echo "  - www.ggacademy.top → $DROPLET_IP"
echo ""
read -p "DNS 설정을 완료하셨습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  DNS 설정을 먼저 완료하세요.${NC}"
  echo ""
  echo "도메인 제공업체에서 다음 설정을 추가하세요:"
  echo "  타입: A"
  echo "  호스트: @ (또는 ggacademy.top)"
  echo "  값: $DROPLET_IP"
  echo "  TTL: 3600"
  echo ""
  echo "  타입: A"
  echo "  호스트: www"
  echo "  값: $DROPLET_IP"
  echo "  TTL: 3600"
  exit 1
fi

# 2. Nginx 설치 확인
echo -e "${BLUE}2. Nginx 설치 확인${NC}"
if ! command -v nginx &> /dev/null; then
  echo "Nginx 설치 중..."
  sudo apt update
  sudo apt install nginx -y
  echo -e "${GREEN}✅ Nginx 설치 완료${NC}"
else
  echo -e "${GREEN}✅ Nginx가 이미 설치되어 있습니다.${NC}"
fi
echo ""

# 3. Nginx 설정 파일 생성
echo -e "${BLUE}3. Nginx 설정 파일 생성${NC}"
sudo tee "$NGINX_CONFIG" > /dev/null <<'EOF'
server {
    listen 80;
    server_name ggacademy.top www.ggacademy.top;

    access_log /var/log/nginx/ggfinder_access.log;
    error_log /var/log/nginx/ggfinder_error.log;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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

echo -e "${GREEN}✅ Nginx 설정 파일 생성 완료${NC}"
echo ""

# 4. 설정 파일 활성화
echo -e "${BLUE}4. 설정 파일 활성화${NC}"
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/ggfinder

# 기본 설정 제거
if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm /etc/nginx/sites-enabled/default
  echo -e "${GREEN}✅ 기본 설정 제거 완료${NC}"
fi

# Nginx 설정 테스트
if sudo nginx -t; then
  echo -e "${GREEN}✅ Nginx 설정 검증 성공${NC}"
  sudo systemctl reload nginx
  sudo systemctl enable nginx
else
  echo -e "${RED}❌ Nginx 설정 검증 실패${NC}"
  exit 1
fi
echo ""

# 5. DNS 전파 확인
echo -e "${BLUE}5. DNS 전파 확인${NC}"
echo "DNS 전파 확인 중..."
sleep 2
DNS_IP=$(dig +short ${DOMAIN} | tail -1 || echo "")
if [ -n "$DNS_IP" ] && [ "$DNS_IP" = "$DROPLET_IP" ]; then
  echo -e "${GREEN}✅ DNS가 올바르게 설정되었습니다.${NC}"
elif [ -n "$DNS_IP" ]; then
  echo -e "${YELLOW}⚠️  DNS IP가 일치하지 않습니다.${NC}"
  echo "   예상 IP: $DROPLET_IP"
  echo "   실제 IP: $DNS_IP"
  echo "   DNS 전파에 시간이 걸릴 수 있습니다."
else
  echo -e "${YELLOW}⚠️  DNS 레코드를 찾을 수 없습니다.${NC}"
  echo "   DNS 전파에 시간이 걸릴 수 있습니다."
fi
echo ""

# 6. Certbot 설치 및 SSL 인증서 발급
echo -e "${BLUE}6. SSL 인증서 발급${NC}"
if ! command -v certbot &> /dev/null; then
  echo "Certbot 설치 중..."
  sudo apt install certbot python3-certbot-nginx -y
fi

echo "SSL 인증서 발급을 진행합니다..."
read -p "이메일 주소를 입력하세요 (선택사항, Enter로 건너뛰기): " EMAIL

if [ -n "$EMAIL" ]; then
  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect
else
  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email --redirect
fi

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ SSL 인증서 발급 완료${NC}"
else
  echo -e "${YELLOW}⚠️  SSL 인증서 발급 실패${NC}"
  echo "수동으로 실행하세요:"
  echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi
echo ""

# 7. 환경 변수 업데이트
echo -e "${BLUE}7. 애플리케이션 환경 변수 업데이트${NC}"
cd /app/ggfinder 2>/dev/null || {
  echo -e "${YELLOW}⚠️  /app/ggfinder 디렉토리를 찾을 수 없습니다.${NC}"
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
  
  echo -e "${GREEN}✅ 환경 변수 업데이트 완료${NC}"
  echo ""
  echo "업데이트된 환경 변수:"
  grep -E "VITE_API_BASE_URL|CORS_ORIGIN|FRONTEND_URL" .env
  echo ""
  
  read -p "컨테이너를 재시작하시겠습니까? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down
    docker compose up -d
    echo -e "${GREEN}✅ 컨테이너 재시작 완료${NC}"
  else
    echo "나중에 다음 명령어로 재시작하세요:"
    echo "  docker compose restart app"
  fi
else
  echo -e "${YELLOW}⚠️  .env 파일을 찾을 수 없습니다.${NC}"
  echo "수동으로 .env 파일을 생성하고 다음을 추가하세요:"
  echo "  VITE_API_BASE_URL=https://${DOMAIN}"
  echo "  CORS_ORIGIN=https://${DOMAIN}"
  echo "  FRONTEND_URL=https://${DOMAIN}"
fi
echo ""

# 8. 방화벽 설정
echo -e "${BLUE}8. 방화벽 설정${NC}"
if command -v ufw &> /dev/null; then
  sudo ufw --force enable
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  echo -e "${GREEN}✅ 방화벽 설정 완료${NC}"
  sudo ufw status
else
  echo -e "${YELLOW}⚠️  UFW가 설치되어 있지 않습니다.${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 설정 완료${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. 브라우저에서 https://${DOMAIN} 접속 확인"
echo "  2. SSL 인증서 확인 (자물쇠 아이콘)"
echo "  3. 애플리케이션 정상 작동 확인"
echo ""
echo "문제가 있으면 다음 로그를 확인하세요:"
echo "  sudo tail -f /var/log/nginx/ggfinder_error.log"
echo "  docker compose logs -f app"
echo ""

