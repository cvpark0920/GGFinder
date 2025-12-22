# HTTPS Mixed Content 오류 해결 가이드

## 문제 상황

도메인으로 접속 시 다음 오류 발생:
- `Mixed Content: The page at 'https://finder.ggacademy.top/' was loaded over HTTPS, but requested an insecure resource 'http://152.42.193.71:4000/api/youtube/public'`
- `ERR_CONNECTION_REFUSED`

## 원인

`VITE_API_BASE_URL`은 **빌드 타임 환경 변수**입니다. 환경 변수를 변경한 후에는 프론트엔드를 **재빌드**해야 합니다.

현재 문제:
1. `.env` 파일에 `VITE_API_BASE_URL`이 HTTP로 설정되어 있음
2. 또는 빌드 시 HTTP로 빌드되었음
3. 컨테이너가 재빌드되지 않아서 이전 빌드가 사용 중

## 해결 방법

### 방법 1: Droplet에서 직접 수정 (빠른 해결)

```bash
# Droplet에 SSH 접속
ssh root@<DROPLET_IP>

# 프로젝트 디렉토리로 이동
cd /app/ggfinder

# .env 파일 확인 및 수정
nano .env
```

`.env` 파일에 다음 추가/수정:

```env
VITE_API_BASE_URL=https://finder.ggacademy.top
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
```

**중요**: 환경 변수 변경 후 **반드시 재빌드**해야 합니다:

```bash
# 컨테이너 중지
docker compose down

# 이미지 재빌드 (캐시 없이)
docker compose build --no-cache

# 컨테이너 시작
docker compose up -d

# 로그 확인
docker compose logs -f app
```

### 방법 2: GitHub Actions를 통한 재배포 (권장)

1. **GitHub Secrets 설정** (선택사항):
   - `Settings` → `Secrets and variables` → `Actions`
   - 다음 Secrets 추가:
     - `FRONTEND_URL`: `https://finder.ggacademy.top`
     - `VITE_API_BASE_URL`: `https://finder.ggacademy.top` (선택사항)
     - `CORS_ORIGIN`: `https://finder.ggacademy.top` (선택사항)

2. **재배포 트리거**:
   - GitHub Actions에서 `deploy` 워크플로우를 수동으로 실행하거나
   - `main` 브랜치에 푸시

배포 워크플로우가 자동으로:
- `.env` 파일에 HTTPS URL 설정
- 빌드 인자로 `VITE_API_BASE_URL` 전달
- 컨테이너 재빌드

### 방법 3: 스크립트 사용

```bash
cd /app/ggfinder
git pull

# 환경 변수 업데이트 스크립트 실행
./scripts/manual-nginx-setup.sh
```

이 스크립트는:
- Nginx 설정
- Certbot 설치 및 SSL 설정
- `.env` 파일 업데이트
- **하지만 컨테이너 재빌드는 수동으로 해야 함**

## 확인 방법

### 1. 빌드된 파일 확인

```bash
# 컨테이너 내부 확인
docker compose exec app sh

# 빌드된 파일 확인
cat build/assets/index-*.js | grep -o 'VITE_API_BASE_URL[^"]*' | head -5
# 또는
cat build/assets/index-*.js | grep -o 'https://finder.ggacademy.top' | head -5
```

### 2. 브라우저에서 확인

1. `https://finder.ggacademy.top` 접속
2. 개발자 도구 (F12) → Network 탭
3. API 요청 확인:
   - ✅ `https://finder.ggacademy.top/api/...` (정상)
   - ❌ `http://152.42.193.71:4000/api/...` (오류)

### 3. 환경 변수 확인

```bash
# .env 파일 확인
cat .env | grep VITE_API_BASE_URL

# Docker 빌드 인자 확인 (배포 로그에서)
# GitHub Actions 로그에서 확인:
# "🔧 Build args: VITE_API_BASE_URL=https://finder.ggacademy.top"
```

## 주의사항

1. **빌드 타임 vs 런타임**:
   - `VITE_API_BASE_URL`: 빌드 타임 (재빌드 필요)
   - `CORS_ORIGIN`, `FRONTEND_URL`: 런타임 (재시작만 필요)

2. **캐시 문제**:
   - Docker 빌드 캐시 때문에 이전 빌드가 사용될 수 있음
   - `--no-cache` 옵션 사용 권장

3. **환경 변수 우선순위**:
   - GitHub Secrets > `.env` 파일 > 기본값
   - 배포 워크플로우에서 Secrets 우선 사용

## 빠른 해결 (Droplet에서)

```bash
cd /app/ggfinder

# .env 파일 업데이트
cat >> .env << EOF
VITE_API_BASE_URL=https://finder.ggacademy.top
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
EOF

# 재빌드 및 재시작
docker compose down
docker compose build --no-cache
docker compose up -d

# 로그 확인
docker compose logs -f app
```

## 추가 문제 해결

### ERR_CONNECTION_REFUSED (127.0.0.1:7243)

이것은 개발 도구의 로깅 기능입니다. 무시해도 됩니다.

코드에서 제거하려면:
- `src/utils/api.ts`에서 `#region agent log` 부분 제거

### Nginx 설정 확인

```bash
# Nginx 설정 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx

# Nginx 로그 확인
sudo tail -f /var/log/nginx/ggfinder_error.log
```

