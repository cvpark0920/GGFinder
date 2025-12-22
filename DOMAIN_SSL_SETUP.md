# 도메인 연결 및 SSL 설정 가이드

DigitalOcean Droplet에 배포된 애플리케이션에 도메인을 연결하고 SSL 인증서를 적용하는 방법을 안내합니다.

## 📋 사전 준비사항

- DigitalOcean Droplet이 실행 중
- 도메인 소유권
- Droplet에 SSH 접속 가능
- 루트 권한 또는 sudo 권한

## 🔧 1단계: Nginx 설치 및 설정

### 1.1 Nginx 설치

```bash
# Droplet에 SSH 접속
ssh <SSH_USERNAME>@<DROPLET_IP>

# 패키지 업데이트
sudo apt update

# Nginx 설치
sudo apt install nginx -y

# Nginx 상태 확인
sudo systemctl status nginx
```

### 1.2 Nginx 설정 파일 생성

```bash
# 설정 파일 생성
sudo nano /etc/nginx/sites-available/ggfinder
```

다음 내용을 입력하세요 (YOUR_DOMAIN을 실제 도메인으로 변경):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    # 로그 파일
    access_log /var/log/nginx/ggfinder_access.log;
    error_log /var/log/nginx/ggfinder_error.log;

    # 프록시 설정
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
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 헬스체크 엔드포인트
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }

    # 파일 업로드 크기 제한
    client_max_body_size 100M;
}
```

### 1.3 설정 파일 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/ggfinder /etc/nginx/sites-enabled/

# 기본 설정 제거 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# 자동 시작 설정
sudo systemctl enable nginx
```

## 🌐 2단계: 도메인 DNS 설정

### 2.1 DNS 레코드 추가

도메인 제공업체의 DNS 관리 패널에서 다음 레코드를 추가하세요:

**A 레코드:**
- **호스트**: `@` 또는 `yourdomain.com`
- **타입**: A
- **값**: `<DROPLET_IP>`
- **TTL**: 3600 (또는 기본값)

**www 서브도메인 (선택사항):**
- **호스트**: `www`
- **타입**: A
- **값**: `<DROPLET_IP>`
- **TTL**: 3600

### 2.2 DNS 전파 확인

```bash
# DNS 전파 확인
dig YOUR_DOMAIN +short
nslookup YOUR_DOMAIN

# 또는 온라인 도구 사용
# https://dnschecker.org/
```

DNS 전파는 보통 몇 분에서 24시간까지 걸릴 수 있습니다.

## 🔒 3단계: SSL 인증서 설치 (Let's Encrypt)

### 3.1 Certbot 설치

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y
```

### 3.2 SSL 인증서 발급

```bash
# SSL 인증서 발급 (자동으로 Nginx 설정 업데이트)
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN

# 또는 대화형 모드
sudo certbot --nginx
```

인증 과정에서:
1. 이메일 주소 입력 (선택사항)
2. 이용 약관 동의
3. 도메인 선택

### 3.3 자동 갱신 설정

Let's Encrypt 인증서는 90일마다 갱신이 필요합니다. 자동 갱신이 이미 설정되어 있지만 테스트해볼 수 있습니다:

```bash
# 갱신 테스트
sudo certbot renew --dry-run

# 갱신 상태 확인
sudo systemctl status certbot.timer
```

## 🔄 4단계: 애플리케이션 환경 변수 업데이트

### 4.1 .env 파일 업데이트

```bash
cd /app/ggfinder

# .env 파일 편집
nano .env
```

다음 환경 변수를 업데이트하세요:

```env
VITE_API_BASE_URL=https://YOUR_DOMAIN
CORS_ORIGIN=https://YOUR_DOMAIN
FRONTEND_URL=https://YOUR_DOMAIN
```

### 4.2 컨테이너 재시작

```bash
# 환경 변수 변경 후 컨테이너 재시작
docker compose down
docker compose up -d

# 또는 GitHub Actions를 통해 재배포
```

## 🛡️ 5단계: 보안 강화 (선택사항)

### 5.1 방화벽 설정

```bash
# UFW 방화벽 활성화
sudo ufw enable

# 필요한 포트만 허용
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# 상태 확인
sudo ufw status
```

### 5.2 Nginx 보안 헤더 추가

`/etc/nginx/sites-available/ggfinder` 파일에 다음을 추가:

```nginx
server {
    # ... 기존 설정 ...

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

설정 후 Nginx 재시작:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📝 6단계: 배포 스크립트 업데이트 (선택사항)

GitHub Actions 배포 스크립트에 도메인 정보를 추가하려면:

1. GitHub Secrets에 도메인 추가:
   - `DOMAIN`: yourdomain.com

2. 배포 스크립트에서 환경 변수 업데이트:
   ```yaml
   VITE_API_BASE_URL=https://${{ secrets.DOMAIN }}
   CORS_ORIGIN=https://${{ secrets.DOMAIN }}
   FRONTEND_URL=https://${{ secrets.DOMAIN }}
   ```

## ✅ 확인 및 테스트

### 도메인 연결 확인

```bash
# HTTP 확인
curl -I http://YOUR_DOMAIN

# HTTPS 확인
curl -I https://YOUR_DOMAIN

# SSL 인증서 확인
openssl s_client -connect YOUR_DOMAIN:443 -servername YOUR_DOMAIN
```

### 브라우저에서 확인

1. `https://YOUR_DOMAIN` 접속
2. SSL 인증서 아이콘 확인 (자물쇠 아이콘)
3. 애플리케이션 정상 작동 확인

## 🔍 문제 해결

### 문제 1: DNS가 전파되지 않음

```bash
# DNS 캐시 확인
dig YOUR_DOMAIN
nslookup YOUR_DOMAIN

# DNS 서버 변경 (필요시)
# /etc/resolv.conf 파일 수정
```

### 문제 2: SSL 인증서 발급 실패

- 도메인이 Droplet IP로 올바르게 설정되었는지 확인
- 방화벽에서 80, 443 포트가 열려있는지 확인
- Nginx가 정상 실행 중인지 확인

```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# Certbot 로그 확인
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 문제 3: 프록시 오류

```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 로그 확인
sudo tail -f /var/log/nginx/ggfinder_error.log

# Docker 컨테이너 상태 확인
cd /app/ggfinder
docker compose ps
docker compose logs app
```

### 문제 4: CORS 오류

`.env` 파일에서 `CORS_ORIGIN`이 올바르게 설정되었는지 확인:

```bash
cd /app/ggfinder
cat .env | grep CORS
```

## 📚 추가 리소스

- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt 문서](https://letsencrypt.org/docs/)
- [Certbot 문서](https://certbot.eff.org/)
- [DigitalOcean DNS 설정 가이드](https://docs.digitalocean.com/products/networking/dns/)

## 🔄 SSL 인증서 갱신

Let's Encrypt 인증서는 90일마다 자동으로 갱신됩니다. 수동으로 갱신하려면:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 📊 모니터링

### SSL 인증서 만료 확인

```bash
# 인증서 만료일 확인
sudo certbot certificates

# 또는
echo | openssl s_client -connect YOUR_DOMAIN:443 -servername YOUR_DOMAIN 2>/dev/null | openssl x509 -noout -dates
```

### Nginx 상태 모니터링

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 접근 로그 확인
sudo tail -f /var/log/nginx/ggfinder_access.log

# 에러 로그 확인
sudo tail -f /var/log/nginx/ggfinder_error.log
```

## 🎯 완료 체크리스트

- [ ] Nginx 설치 및 설정 완료
- [ ] 도메인 DNS 레코드 추가 완료
- [ ] DNS 전파 확인 완료
- [ ] SSL 인증서 발급 완료
- [ ] 애플리케이션 환경 변수 업데이트 완료
- [ ] HTTPS 접속 확인 완료
- [ ] 방화벽 설정 완료 (선택사항)
- [ ] 보안 헤더 추가 완료 (선택사항)

