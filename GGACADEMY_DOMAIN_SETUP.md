# ggacademy.top 도메인 설정 가이드

## 🎯 목표
`ggacademy.top` 도메인을 DigitalOcean Droplet에 연결하고 SSL 인증서를 적용합니다.

## 📋 사전 준비사항

1. **도메인 소유권 확인**
   - `ggacademy.top` 도메인을 소유하고 있어야 합니다
   - 도메인 제공업체의 DNS 관리 패널에 접근 가능해야 합니다

2. **Droplet 정보**
   - Droplet IP 주소 확인 필요
   - SSH 접속 가능

## 🌐 1단계: DNS 설정

### 도메인 제공업체에서 다음 DNS 레코드 추가:

**A 레코드 1:**
- **호스트**: `@` 또는 `ggacademy.top`
- **타입**: A
- **값**: `<DROPLET_IP>` (DigitalOcean Droplet의 공인 IP)
- **TTL**: 3600 (또는 기본값)

**A 레코드 2:**
- **호스트**: `www`
- **타입**: A
- **값**: `<DROPLET_IP>` (동일한 IP)
- **TTL**: 3600 (또는 기본값)

### DNS 전파 확인

DNS 설정 후 전파 확인:

```bash
# 명령어로 확인
dig ggacademy.top +short
nslookup ggacademy.top

# 또는 온라인 도구 사용
# https://dnschecker.org/#A/ggacademy.top
```

DNS 전파는 보통 몇 분에서 24시간까지 걸릴 수 있습니다.

## 🚀 2단계: 자동 설정 스크립트 실행

### 방법 1: 자동화 스크립트 사용 (권장)

```bash
# Droplet에 SSH 접속
ssh <SSH_USERNAME>@<DROPLET_IP>

# 저장소 업데이트
cd /app/ggfinder
git pull

# 스크립트 실행
./scripts/setup-ggacademy-domain.sh
```

스크립트가 자동으로:
- ✅ Nginx 설치 및 설정
- ✅ DNS 확인
- ✅ SSL 인증서 발급
- ✅ 환경 변수 업데이트
- ✅ 방화벽 설정

### 방법 2: 수동 설정

#### 2.1 Nginx 설치

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
```

#### 2.2 Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/ggfinder
```

다음 내용 입력:

```nginx
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
```

#### 2.3 설정 파일 활성화

```bash
sudo ln -s /etc/nginx/sites-available/ggfinder /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 기본 설정 제거
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx
```

## 🔒 3단계: SSL 인증서 발급

### Certbot 설치

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### SSL 인증서 발급

```bash
sudo certbot --nginx -d ggacademy.top -d www.ggacademy.top
```

인증 과정에서:
1. 이메일 주소 입력 (선택사항)
2. 이용 약관 동의 (Y 입력)
3. 도메인 선택 (Enter로 모두 선택)

Certbot이 자동으로:
- SSL 인증서 발급
- Nginx 설정 업데이트
- HTTP → HTTPS 리다이렉트 설정

## ⚙️ 4단계: 애플리케이션 환경 변수 업데이트

### .env 파일 업데이트

```bash
cd /app/ggfinder
nano .env
```

다음 환경 변수를 추가/수정:

```env
VITE_API_BASE_URL=https://ggacademy.top
CORS_ORIGIN=https://ggacademy.top
FRONTEND_URL=https://ggacademy.top
```

### 컨테이너 재시작

```bash
docker compose down
docker compose up -d
```

또는 GitHub Actions를 통해 재배포하면 자동으로 적용됩니다.

## 🛡️ 5단계: 방화벽 설정

```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status
```

## ✅ 확인 및 테스트

### 도메인 연결 확인

```bash
# HTTP 확인
curl -I http://ggacademy.top

# HTTPS 확인
curl -I https://ggacademy.top

# SSL 인증서 확인
openssl s_client -connect ggacademy.top:443 -servername ggacademy.top
```

### 브라우저에서 확인

1. `https://ggacademy.top` 접속
2. SSL 인증서 아이콘 확인 (자물쇠 아이콘)
3. 애플리케이션 정상 작동 확인

## 🔍 문제 해결

### DNS가 전파되지 않음

```bash
# DNS 확인
dig ggacademy.top +short
nslookup ggacademy.top

# DNS 서버 변경 (필요시)
# /etc/resolv.conf 파일 수정
```

### SSL 인증서 발급 실패

- 도메인이 Droplet IP로 올바르게 설정되었는지 확인
- 방화벽에서 80, 443 포트가 열려있는지 확인
- Nginx가 정상 실행 중인지 확인

```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# Certbot 로그 확인
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 프록시 오류

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

### CORS 오류

`.env` 파일에서 `CORS_ORIGIN`이 올바르게 설정되었는지 확인:

```bash
cd /app/ggfinder
cat .env | grep CORS
```

## 🔄 SSL 인증서 자동 갱신

Let's Encrypt 인증서는 90일마다 자동으로 갱신됩니다. 수동으로 갱신하려면:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

갱신 테스트:

```bash
sudo certbot renew --dry-run
```

## 📊 모니터링

### SSL 인증서 만료 확인

```bash
sudo certbot certificates
```

### Nginx 상태 모니터링

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/ggfinder_access.log
sudo tail -f /var/log/nginx/ggfinder_error.log
```

## 📝 체크리스트

- [ ] DNS A 레코드 추가 완료 (ggacademy.top → Droplet IP)
- [ ] DNS A 레코드 추가 완료 (www.ggacademy.top → Droplet IP)
- [ ] DNS 전파 확인 완료
- [ ] Nginx 설치 및 설정 완료
- [ ] SSL 인증서 발급 완료
- [ ] 애플리케이션 환경 변수 업데이트 완료
- [ ] 컨테이너 재시작 완료
- [ ] HTTPS 접속 확인 완료
- [ ] 방화벽 설정 완료

## 🎯 완료 후 확인

설정이 완료되면 다음을 확인하세요:

1. ✅ `https://ggacademy.top` 접속 가능
2. ✅ `https://www.ggacademy.top` 접속 가능 (www 리다이렉트)
3. ✅ SSL 인증서 정상 작동 (자물쇠 아이콘)
4. ✅ 애플리케이션 정상 작동
5. ✅ API 호출 정상 작동

