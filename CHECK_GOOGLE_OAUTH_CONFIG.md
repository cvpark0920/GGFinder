# Google OAuth 설정 확인 방법

## 로그 확인 방법

### 방법 1: 전체 로그 확인 (권장)

```bash
# 전체 로그에서 Google OAuth 관련 부분 확인
docker compose logs app | grep -A 10 "Google OAuth Config"
```

`-A 10` 옵션은 매칭된 줄 이후 10줄을 표시합니다.

### 방법 2: 최근 로그 확인

```bash
# 최근 100줄 확인
docker compose logs app --tail=100 | grep -A 10 "Google OAuth Config"
```

### 방법 3: 실시간 로그 확인

```bash
# 실시간 로그 확인 (Ctrl+C로 종료)
docker compose logs -f app | grep -A 10 "Google OAuth Config"
```

### 방법 4: 환경 변수 직접 확인

```bash
# 컨테이너 내부에서 환경 변수 확인
docker compose exec app env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|GOOGLE_CLIENT_ID"
```

### 방법 5: .env 파일 확인

```bash
# .env 파일에서 관련 환경 변수 확인
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|GOOGLE_CLIENT_ID"
```

## 예상 출력

정상적인 경우 다음과 같이 출력되어야 합니다:

```
[Google OAuth Config] {
  GOOGLE_CLIENT_ID: '407454942798-ive9ifpo...',
  GOOGLE_CLIENT_SECRET: 'SET',
  GOOGLE_REDIRECT_URI: 'https://finder.ggacademy.top/api/auth/google/callback',
  FRONTEND_URL: 'https://finder.ggacademy.top',
  CORS_ORIGIN: 'https://finder.ggacademy.top',
  frontendBaseUrl: 'https://finder.ggacademy.top'
}
```

## 문제 해결

### 로그가 비어있는 경우

1. **컨테이너 재시작**:
   ```bash
   docker compose restart app
   ```

2. **로그 다시 확인**:
   ```bash
   docker compose logs app --tail=50 | grep -A 10 "Google OAuth Config"
   ```

### GOOGLE_REDIRECT_URI가 localhost인 경우

1. **환경 변수 확인**:
   ```bash
   cat .env | grep FRONTEND_URL
   ```

2. **환경 변수 추가/수정**:
   ```bash
   nano .env
   # FRONTEND_URL=https://finder.ggacademy.top 추가
   ```

3. **컨테이너 재시작**:
   ```bash
   docker compose restart app
   ```

### 환경 변수가 설정되지 않은 경우

1. **GitHub Secrets 확인**:
   - `Settings` → `Secrets and variables` → `Actions`
   - `FRONTEND_URL` Secret 확인

2. **재배포**:
   ```bash
   # GitHub Actions에서 수동 실행 또는
   git commit --allow-empty -m "trigger: 환경 변수 확인을 위한 재배포"
   git push origin main
   ```

## 빠른 확인 명령어

```bash
# 한 번에 모든 정보 확인
echo "=== .env 파일 ===" && \
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|GOOGLE_CLIENT_ID" && \
echo "" && \
echo "=== 컨테이너 환경 변수 ===" && \
docker compose exec app env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|GOOGLE_CLIENT_ID" && \
echo "" && \
echo "=== 로그 (최근) ===" && \
docker compose logs app --tail=200 | grep -A 10 "Google OAuth Config" | tail -20
```

