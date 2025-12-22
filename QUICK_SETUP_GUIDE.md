# finder.ggacademy.top 빠른 설정 가이드

## ⚡ 빠른 시작 (3단계)

### 1단계: DNS 설정 (도메인 제공업체에서)

도메인 제공업체의 DNS 관리 패널에서:

**A 레코드 추가:**
- **호스트**: `finder`
- **타입**: A
- **값**: `<DROPLET_IP>` (DigitalOcean Droplet의 공인 IP)
- **TTL**: 3600

### 2단계: Droplet에서 스크립트 실행

```bash
# Droplet에 SSH 접속
ssh <SSH_USERNAME>@<DROPLET_IP>

# 저장소 업데이트
cd /app/ggfinder
git pull

# 자동 설정 스크립트 실행
./scripts/setup-ggacademy-domain.sh
```

### 3단계: 확인

```bash
# HTTPS 접속 확인
curl -I https://finder.ggacademy.top

# 브라우저에서 확인
# https://finder.ggacademy.top
```

## 📋 스크립트가 자동으로 하는 일

1. ✅ Nginx 설치 (없는 경우)
2. ✅ Nginx 설정 파일 생성 (`finder.ggacademy.top`)
3. ✅ DNS 전파 확인
4. ✅ SSL 인증서 발급 (Let's Encrypt)
5. ✅ 환경 변수 업데이트 (`VITE_API_BASE_URL`, `CORS_ORIGIN`, `FRONTEND_URL`)
6. ✅ 방화벽 설정 (80, 443 포트 허용)

## ⚠️ 주의사항

- DNS 설정을 먼저 완료해야 SSL 인증서 발급이 가능합니다
- DNS 전파에 시간이 걸릴 수 있습니다 (몇 분~24시간)
- 스크립트 실행 중 이메일 주소를 물어볼 수 있습니다 (선택사항)

## 🔍 현재 상태 확인

Droplet에 접속하여 다음을 확인할 수 있습니다:

```bash
# Nginx 설치 여부 확인
nginx -v

# Nginx 설정 파일 확인
ls -la /etc/nginx/sites-available/ggfinder

# SSL 인증서 확인
sudo certbot certificates

# 환경 변수 확인
cd /app/ggfinder
cat .env | grep -E "VITE_API_BASE_URL|CORS_ORIGIN|FRONTEND_URL"
```

## 🚨 문제 발생 시

스크립트 실행 중 문제가 발생하면:

1. 에러 메시지 확인
2. `FINDER_SUBDOMAIN_SETUP.md` 파일의 "문제 해결" 섹션 참고
3. 로그 확인:
   ```bash
   sudo tail -f /var/log/nginx/ggfinder_error.log
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   ```

