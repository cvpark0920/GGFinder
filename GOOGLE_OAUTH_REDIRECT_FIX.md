# Google OAuth 리디렉션 문제 해결 가이드

## 문제 상황

배포 사이트에서 Google 로그인 시 `http://localhost:4000/login`으로 리다이렉트되는 문제

## 원인

1. **`GOOGLE_REDIRECT_URI` 환경 변수 미설정**
   - 기본값이 `http://localhost:4000/api/auth/google/callback`로 설정됨
   - Google Cloud Console에 localhost URI가 등록되어 있을 수 있음

2. **`FRONTEND_URL` 환경 변수 미설정**
   - OAuth 콜백 후 리디렉션 URL 결정 시 fallback으로 localhost 사용

3. **Google Cloud Console 설정**
   - 승인된 리디렉션 URI에 프로덕션 URL이 등록되지 않음

## 해결 방법

### 1단계: Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI**에 다음 추가:
   - `https://finder.ggacademy.top/api/auth/google/callback`
   - `http://localhost:4000/api/auth/google/callback` (로컬 개발용)

### 2단계: 환경 변수 설정

#### GitHub Secrets 설정 (권장)

1. `Settings` → `Secrets and variables` → `Actions`
2. 다음 Secrets 확인/추가:
   - `FRONTEND_URL`: `https://finder.ggacademy.top`
   - `GOOGLE_REDIRECT_URI`: `https://finder.ggacademy.top/api/auth/google/callback` (선택사항)

#### Droplet에서 직접 설정

```bash
cd /app/ggfinder

# .env 파일 수정
nano .env
```

다음 환경 변수 추가/수정:

```env
FRONTEND_URL=https://finder.ggacademy.top
GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback
```

**중요**: 환경 변수 변경 후 컨테이너 재시작:

```bash
docker compose restart app
```

### 3단계: 코드 수정 (이미 적용됨)

코드가 자동으로 `FRONTEND_URL`을 기반으로 `GOOGLE_REDIRECT_URI`를 생성하도록 수정되었습니다:

```typescript
// server/routes/auth.ts
const frontendBaseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:4000';
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${frontendBaseUrl}/api/auth/google/callback`;
```

## 확인 방법

### 1. 환경 변수 확인

```bash
# Droplet에서 확인
ssh root@<DROPLET_IP>
cd /app/ggfinder
cat .env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI|CORS_ORIGIN"
```

예상 출력:
```
FRONTEND_URL=https://finder.ggacademy.top
GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback
CORS_ORIGIN=https://finder.ggacademy.top
```

### 2. 컨테이너 로그 확인

```bash
docker compose logs app | grep "Google OAuth Config"
```

예상 출력:
```
[Google OAuth Config] {
  GOOGLE_CLIENT_ID: '407454942798-ive9ifpo...',
  GOOGLE_CLIENT_SECRET: 'SET',
  GOOGLE_REDIRECT_URI: 'https://finder.ggacademy.top/api/auth/google/callback',
  FRONTEND_URL: 'https://finder.ggacademy.top',
  ...
}
```

### 3. 브라우저에서 테스트

1. `https://finder.ggacademy.top/login` 접속
2. Google 로그인 버튼 클릭
3. Google 인증 완료 후 `https://finder.ggacademy.top/auth/callback`로 리디렉트되는지 확인

## 문제 해결 체크리스트

- [ ] Google Cloud Console에 `https://finder.ggacademy.top/api/auth/google/callback` 등록됨
- [ ] `.env` 파일에 `FRONTEND_URL=https://finder.ggacademy.top` 설정됨
- [ ] `.env` 파일에 `GOOGLE_REDIRECT_URI` 설정됨 (선택사항, 자동 생성됨)
- [ ] 컨테이너 재시작 완료
- [ ] 컨테이너 로그에서 올바른 리디렉션 URI 확인됨
- [ ] 브라우저에서 정상적으로 리디렉트됨

## 추가 문제 해결

### 여전히 localhost로 리디렉트되는 경우

1. **환경 변수 확인**:
   ```bash
   docker compose exec app env | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI"
   ```

2. **컨테이너 재시작**:
   ```bash
   docker compose restart app
   ```

3. **컨테이너 재빌드** (환경 변수가 빌드 타임에 필요하지 않으므로 일반적으로 불필요):
   ```bash
   docker compose down
   docker compose up -d
   ```

### Google Cloud Console 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI** 확인:
   - `https://finder.ggacademy.top/api/auth/google/callback` 포함되어 있어야 함
   - `http://localhost:4000/api/auth/google/callback` (로컬 개발용)

### 디버깅 로그 확인

```bash
# OAuth 리디렉션 로그 확인
docker compose logs app | grep -E "OAuth|Google OAuth"

# 환경 변수 확인
docker compose logs app | grep -E "FRONTEND_URL|GOOGLE_REDIRECT_URI"
```

## 빠른 해결 (Droplet에서)

```bash
cd /app/ggfinder

# .env 파일에 환경 변수 추가
cat >> .env << EOF
FRONTEND_URL=https://finder.ggacademy.top
GOOGLE_REDIRECT_URI=https://finder.ggacademy.top/api/auth/google/callback
EOF

# 컨테이너 재시작
docker compose restart app

# 로그 확인
docker compose logs -f app | grep "Google OAuth"
```

## 주의사항

1. **Google Cloud Console 설정**:
   - 리디렉션 URI는 정확히 일치해야 함
   - `https://finder.ggacademy.top/api/auth/google/callback` (정확한 경로)

2. **환경 변수 우선순위**:
   - `GOOGLE_REDIRECT_URI` (명시적 설정)
   - `FRONTEND_URL` 기반 자동 생성
   - 기본값: `http://localhost:4000/api/auth/google/callback`

3. **HTTPS 필수**:
   - 프로덕션 환경에서는 HTTPS를 사용해야 함
   - Google OAuth는 HTTPS를 요구함

