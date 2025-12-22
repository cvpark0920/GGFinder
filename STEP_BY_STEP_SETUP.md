# finder.ggacademy.top 단계별 설정 가이드

현재 상태에 맞춘 단계별 설정 가이드입니다.

## 🔍 현재 상태 확인

```bash
# Nginx 설치 확인
nginx -v

# Certbot 설치 확인
certbot --version

# Nginx 설정 파일 확인
ls -la /etc/nginx/sites-available/ggfinder
```

## 📋 단계별 설정

### 1단계: Certbot 설치

```bash
# 패키지 업데이트
sudo apt update

# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 설치 확인
certbot --version
```

또는 스크립트 사용:
```bash
cd /app/ggfinder
git pull
./scripts/install-certbot.sh
```

### 2단계: Nginx 설치 확인

```bash
# Nginx 설치 확인
nginx -v

# 설치되어 있지 않으면
sudo apt install nginx -y
```

### 3단계: Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/ggfinder
```

다음 내용 입력:

```nginx
server {
    listen 80;
    server_name finder.ggacademy.top;

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
```

### 4단계: 설정 파일 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/ggfinder /etc/nginx/sites-enabled/

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

### 5단계: DNS 확인

```bash
# DNS 확인
dig finder.ggacademy.top +short
nslookup finder.ggacademy.top

# Droplet IP 확인
curl -s ifconfig.me
```

DNS가 Droplet IP로 설정되어 있어야 SSL 인증서 발급이 가능합니다.

### 6단계: SSL 인증서 발급

```bash
# SSL 인증서 발급
sudo certbot --nginx -d finder.ggacademy.top
```

인증 과정에서:
1. 이메일 주소 입력 (선택사항)
2. 이용 약관 동의 (Y)
3. HTTP → HTTPS 리다이렉트 (Y 권장)

### 7단계: 환경 변수 업데이트

```bash
cd /app/ggfinder
nano .env
```

다음 환경 변수 추가/수정:

```env
VITE_API_BASE_URL=https://finder.ggacademy.top
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
```

### 8단계: 컨테이너 재시작

```bash
docker compose restart app
```

또는

```bash
docker compose down
docker compose up -d
```

## ✅ 확인

```bash
# HTTPS 접속 확인
curl -I https://finder.ggacademy.top

# SSL 인증서 확인
sudo certbot certificates

# Nginx 상태 확인
sudo systemctl status nginx

# 컨테이너 상태 확인
docker compose ps
```

## 🚨 문제 해결

### Certbot 설치 실패

```bash
# 패키지 목록 업데이트
sudo apt update

# 다시 설치 시도
sudo apt install certbot python3-certbot-nginx -y
```

### SSL 인증서 발급 실패

- DNS가 올바르게 설정되었는지 확인
- 방화벽에서 80, 443 포트가 열려있는지 확인
- Nginx가 정상 실행 중인지 확인

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 방화벽 확인
sudo ufw status
```

