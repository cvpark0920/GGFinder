#!/bin/bash
# 도메인 및 SSL 설정 자동화 스크립트

set -euo pipefail

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 도메인 및 SSL 설정 스크립트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 도메인 입력
read -p "도메인을 입력하세요 (예: example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo -e "${RED}❌ 도메인이 입력되지 않았습니다.${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}📋 입력된 도메인: ${DOMAIN}${NC}"
echo ""

# 1. Nginx 설치 확인
echo -e "${BLUE}1. Nginx 설치 확인${NC}"
if ! command -v nginx &> /dev/null; then
  echo "Nginx가 설치되어 있지 않습니다. 설치를 진행합니다..."
  sudo apt update
  sudo apt install nginx -y
else
  echo -e "${GREEN}✅ Nginx가 이미 설치되어 있습니다.${NC}"
fi
echo ""

# 2. Nginx 설정 파일 생성
echo -e "${BLUE}2. Nginx 설정 파일 생성${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/ggfinder"

sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

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

echo -e "${GREEN}✅ Nginx 설정 파일 생성 완료${NC}"
echo ""

# 3. 설정 파일 활성화
echo -e "${BLUE}3. 설정 파일 활성화${NC}"
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/ggfinder

# 기본 설정 제거 확인
if [ -f /etc/nginx/sites-enabled/default ]; then
  read -p "기본 Nginx 설정을 제거하시겠습니까? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo rm /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✅ 기본 설정 제거 완료${NC}"
  fi
fi

# Nginx 설정 테스트
if sudo nginx -t; then
  echo -e "${GREEN}✅ Nginx 설정 검증 성공${NC}"
  sudo systemctl reload nginx
else
  echo -e "${RED}❌ Nginx 설정 검증 실패${NC}"
  exit 1
fi
echo ""

# 4. Certbot 설치 확인
echo -e "${BLUE}4. Certbot 설치 확인${NC}"
if ! command -v certbot &> /dev/null; then
  echo "Certbot이 설치되어 있지 않습니다. 설치를 진행합니다..."
  sudo apt install certbot python3-certbot-nginx -y
else
  echo -e "${GREEN}✅ Certbot이 이미 설치되어 있습니다.${NC}"
fi
echo ""

# 5. DNS 확인
echo -e "${BLUE}5. DNS 설정 확인${NC}"
DROPLET_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "Droplet IP: $DROPLET_IP"
echo ""
echo "도메인 DNS 설정을 확인하세요:"
echo "  A 레코드: ${DOMAIN} -> ${DROPLET_IP}"
echo "  A 레코드: www.${DOMAIN} -> ${DROPLET_IP}"
echo ""

read -p "DNS 설정이 완료되었습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  DNS 설정을 완료한 후 다시 실행하세요.${NC}"
  exit 1
fi

# DNS 전파 확인
echo "DNS 전파 확인 중..."
DNS_IP=$(dig +short ${DOMAIN} | tail -1)
if [ "$DNS_IP" = "$DROPLET_IP" ]; then
  echo -e "${GREEN}✅ DNS가 올바르게 설정되었습니다.${NC}"
else
  echo -e "${YELLOW}⚠️  DNS가 아직 전파되지 않았을 수 있습니다.${NC}"
  echo "   예상 IP: $DROPLET_IP"
  echo "   실제 IP: $DNS_IP"
  read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
echo ""

# 6. SSL 인증서 발급
echo -e "${BLUE}6. SSL 인증서 발급${NC}"
read -p "SSL 인증서를 발급하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Certbot을 실행합니다..."
  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || {
    echo -e "${YELLOW}⚠️  자동 발급 실패. 수동으로 실행하세요:${NC}"
    echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
  }
else
  echo -e "${YELLOW}⚠️  SSL 인증서 발급을 건너뜁니다.${NC}"
  echo "나중에 다음 명령어로 발급할 수 있습니다:"
  echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi
echo ""

# 7. 환경 변수 업데이트 안내
echo -e "${BLUE}7. 애플리케이션 환경 변수 업데이트${NC}"
echo "다음 환경 변수를 업데이트하세요:"
echo ""
echo "cd /app/ggfinder"
echo "nano .env"
echo ""
echo "다음 내용 추가/수정:"
echo "  VITE_API_BASE_URL=https://${DOMAIN}"
echo "  CORS_ORIGIN=https://${DOMAIN}"
echo "  FRONTEND_URL=https://${DOMAIN}"
echo ""
read -p "지금 환경 변수를 업데이트하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd /app/ggfinder 2>/dev/null || {
    echo -e "${RED}❌ /app/ggfinder 디렉토리를 찾을 수 없습니다.${NC}"
    echo "수동으로 환경 변수를 업데이트하세요."
  }
  
  if [ -f .env ]; then
    # 환경 변수 업데이트
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://${DOMAIN}|g" .env
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://${DOMAIN}|g" .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|g" .env
    
    echo -e "${GREEN}✅ 환경 변수 업데이트 완료${NC}"
    echo ""
    echo "컨테이너를 재시작하세요:"
    echo "  docker compose down"
    echo "  docker compose up -d"
  else
    echo -e "${YELLOW}⚠️  .env 파일을 찾을 수 없습니다.${NC}"
  fi
fi
echo ""

# 8. 방화벽 설정 안내
echo -e "${BLUE}8. 방화벽 설정${NC}"
read -p "방화벽을 설정하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sudo ufw --force enable
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw status
  echo -e "${GREEN}✅ 방화벽 설정 완료${NC}"
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

