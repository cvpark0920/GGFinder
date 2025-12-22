# Google OAuth 로그인 문제 해결 가이드

## 문제 상황

Google 로그인이 작동하지 않으며 다음 오류 발생:
- `The given client ID is not found.`
- `clientId: 'test-client-id...'` (잘못된 클라이언트 ID)
- `invalid_state` 오류

## 원인

1. **`VITE_GOOGLE_CLIENT_ID`가 빌드 타임 환경 변수**이므로 재빌드 필요
2. Google Cloud Console에 올바른 origin이 등록되지 않음
3. 환경 변수가 빌드 시 전달되지 않음

## 해결 방법

### 1단계: Google Cloud Console 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 JavaScript 원본**에 다음 추가:
   - `https://finder.ggacademy.top`
   - `http://localhost:4000` (로컬 개발용)
4. **승인된 리디렉션 URI**에 다음 추가:
   - `https://finder.ggacademy.top/api/auth/google/redirect`
   - `http://localhost:4000/api/auth/google/redirect` (로컬 개발용)

### 2단계: Droplet에서 환경 변수 확인 및 설정

```bash
# Droplet에 SSH 접속
ssh root@<DROPLET_IP>

cd /app/ggfinder

# .env 파일 확인
cat .env | grep GOOGLE_CLIENT_ID

# .env 파일에 Google Client ID 추가/수정
nano .env
```

`.env` 파일에 다음 추가/수정:

```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 빌드 타임 환경 변수 (Vite)
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
```

**중요**: `VITE_GOOGLE_CLIENT_ID`는 빌드 타임 환경 변수이므로 **반드시 재빌드**해야 합니다.

### 3단계: 컨테이너 재빌드

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

### 4단계: GitHub Secrets 설정 (재배포용)

GitHub에서 다음 Secrets 설정:

1. `Settings` → `Secrets and variables` → `Actions`
2. 다음 Secrets 확인/추가:
   - `GOOGLE_CLIENT_ID`: 실제 Google Client ID
   - `GOOGLE_CLIENT_SECRET`: 실제 Google Client Secret

배포 워크플로우가 자동으로:
- `.env` 파일에 `GOOGLE_CLIENT_ID` 설정
- 빌드 인자로 `VITE_GOOGLE_CLIENT_ID` 전달
- 컨테이너 재빌드

## 확인 방법

### 1. 브라우저 콘솔 확인

개발자 도구 (F12) → Console 탭에서:

```javascript
// 다음이 출력되어야 함:
[DEBUG] Google OAuth Configuration: {
  clientId: "실제-클라이언트-ID...",
  clientIdLength: 72, // 또는 실제 길이
  origin: "https://finder.ggacademy.top",
  envVar: "SET"
}
```

### 2. 빌드된 파일 확인

```bash
# 컨테이너 내부 확인
docker compose exec app sh

# 빌드된 파일에서 클라이언트 ID 확인
grep -r "VITE_GOOGLE_CLIENT_ID" build/ || echo "Not found in build"
```

### 3. Google OAuth 테스트

1. `https://finder.ggacademy.top/login` 접속
2. Google 로그인 버튼 클릭
3. 정상적으로 Google 로그인 팝업이 열리는지 확인

## 문제 해결 체크리스트

- [ ] Google Cloud Console에 `https://finder.ggacademy.top` origin 등록됨
- [ ] Google Cloud Console에 리디렉션 URI 등록됨
- [ ] `.env` 파일에 `GOOGLE_CLIENT_ID` 설정됨
- [ ] `.env` 파일에 `VITE_GOOGLE_CLIENT_ID` 설정됨
- [ ] 컨테이너 재빌드 완료 (`--no-cache` 옵션 사용)
- [ ] 브라우저 콘솔에서 올바른 클라이언트 ID 확인됨
- [ ] Google 로그인 팝업이 정상적으로 열림

## 추가 문제 해결

### "test-client-id"가 표시되는 경우

빌드 시 환경 변수가 전달되지 않았습니다:

```bash
# 빌드 인자 확인
docker compose config | grep VITE_GOOGLE_CLIENT_ID

# 재빌드
docker compose build --no-cache
```

### "invalid_state" 오류

Google Cloud Console에 origin이 등록되지 않았거나, 쿠키 설정 문제일 수 있습니다:

1. Google Cloud Console에서 origin 확인
2. 브라우저 쿠키 삭제 후 재시도
3. 시크릿 모드에서 테스트

### 클라이언트 ID를 찾을 수 없음

1. Google Cloud Console에서 클라이언트 ID 확인
2. `.env` 파일의 클라이언트 ID와 일치하는지 확인
3. 컨테이너 재빌드

## 빠른 해결 (Droplet에서)

```bash
cd /app/ggfinder

# .env 파일에 Google Client ID 추가
cat >> .env << EOF
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
EOF

# 재빌드 및 재시작
docker compose down
docker compose build --no-cache
docker compose up -d

# 로그 확인
docker compose logs -f app
```

**주의**: `your-actual-google-client-id.apps.googleusercontent.com`을 실제 Google Client ID로 교체하세요.

