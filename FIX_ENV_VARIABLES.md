# 환경 변수 수정 가이드

## 문제 발견

컨테이너 로그에서 환경 변수가 여전히 `http://localhost:4000`으로 설정되어 있습니다:

```
GOOGLE_REDIRECT_URI: 'http://localhost:4000/api/auth/google/callback',
FRONTEND_URL: 'http://localhost:4000',
CORS_ORIGIN: 'http://localhost:4000',
```

## 해결 방법

### 방법 1: Droplet에서 직접 수정 (즉시 적용)

```bash
cd /app/ggfinder

# .env 파일 확인
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN"

# .env 파일 수정
nano .env
```

다음과 같이 수정:

```env
# 기존 (잘못된 값)
FRONTEND_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:4000
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# 수정 후 (올바른 값)
FRONTEND_URL=https://finder.ggacademy.top
CORS_ORIGIN=https://finder.ggacademy.top
GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback
```

또는 한 번에 수정:

```bash
# 백업
cp .env .env.backup

# sed로 일괄 수정
sed -i 's|FRONTEND_URL=http://localhost:4000|FRONTEND_URL=https://finder.ggacademy.top|g' .env
sed -i 's|CORS_ORIGIN=http://localhost:4000|CORS_ORIGIN=https://finder.ggacademy.top|g' .env
sed -i 's|GOOGLE_REDIRECT_URI=http://localhost:4000|GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback|g' .env

# 확인
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN"

# 컨테이너 재시작
docker compose restart app

# 로그 확인
docker compose logs app | grep -A 10 "Google OAuth Config"
```

### 방법 2: GitHub Secrets 설정 후 재배포 (권장)

1. **GitHub Secrets 확인/설정**:
   - `Settings` → `Secrets and variables` → `Actions`
   - `FRONTEND_URL`: `https://finder.ggacademy.top` 확인/추가

2. **재배포**:
   ```bash
   git commit --allow-empty -m "trigger: 환경 변수 수정을 위한 재배포"
   git push origin main
   ```

## 확인

수정 후 다음 명령어로 확인:

```bash
# .env 파일 확인
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN"

# 컨테이너 환경 변수 확인
docker compose exec app env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN"

# 로그 확인
docker compose logs app | grep -A 10 "Google OAuth Config"
```

예상 출력:
```
GOOGLE_REDIRECT_URI: 'https://finder.ggacademy.top/api/auth/google/callback',
FRONTEND_URL: 'https://finder.ggacademy.top',
CORS_ORIGIN: 'https://finder.ggacademy.top',
```

## 빠른 해결 (한 번에)

```bash
cd /app/ggfinder

# 백업
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 일괄 수정
sed -i 's|http://localhost:4000|https://finder.ggacademy.top|g' .env
sed -i 's|http://152.42.193.71:4000|https://finder.ggacademy.top|g' .env

# GOOGLE_REDIRECT_URI가 없으면 추가
if ! grep -q "GOOGLE_REDIRECT_URI=" .env; then
  echo "GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback" >> .env
fi

# 확인
echo "=== 수정된 환경 변수 ==="
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN|VITE_API_BASE_URL"

# 컨테이너 재시작
docker compose restart app

# 로그 확인 (잠시 대기 후)
sleep 5
docker compose logs app --tail=50 | grep -A 10 "Google OAuth Config"
```

