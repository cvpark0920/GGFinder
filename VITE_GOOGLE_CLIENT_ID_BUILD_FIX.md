# VITE_GOOGLE_CLIENT_ID 빌드 타임 에러 해결 가이드

## 🔍 문제 원인

에러: "VITE_GOOGLE_CLIENT_ID is not set in environment variables"

원인:
- `VITE_GOOGLE_CLIENT_ID`가 빌드 타임에 Docker 빌드로 전달되지 않음
- DigitalOcean 콘솔에서 `VITE_GOOGLE_CLIENT_ID`가 `BUILD_TIME` `SECRET`으로 설정되지 않았거나
- `build_command`에서 환경 변수를 제대로 참조하지 못함

## ✅ 해결 방법

### 1. DigitalOcean 콘솔에서 환경 변수 확인 및 설정

**중요: `VITE_GOOGLE_CLIENT_ID`는 반드시 `BUILD_TIME` `SECRET`으로 설정해야 합니다!**

1. **DigitalOcean 콘솔 접속**
   - https://cloud.digitalocean.com/apps
   - 앱 선택 > Settings > App-Level Environment Variables

2. **VITE_GOOGLE_CLIENT_ID 확인/추가**
   - Key: `VITE_GOOGLE_CLIENT_ID`
   - Value: `GOOGLE_CLIENT_ID`와 **동일한 값** (Google OAuth 클라이언트 ID)
   - Scope: **`BUILD_TIME`** (매우 중요!)
   - Type: **`SECRET`** (매우 중요!)

3. **GOOGLE_CLIENT_ID도 확인**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Google OAuth 클라이언트 ID
   - Scope: `RUN_TIME` (서버에서 사용)
   - Type: `SECRET`

### 2. app.yaml 설정 확인

`app.yaml`에서 다음 설정이 올바른지 확인:

```yaml
envs:
  - key: VITE_GOOGLE_CLIENT_ID
    scope: BUILD_TIME
    type: SECRET
  - key: GOOGLE_CLIENT_ID
    scope: RUN_TIME
    type: SECRET
```

### 3. build_command 확인

`app.yaml`의 `build_command`에서 `VITE_GOOGLE_CLIENT_ID`를 전달:

```yaml
build_command: |
  docker build \
    --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://ggfinder-app-joib6.ondigitalocean.app}" \
    --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
    -t app \
    -f Dockerfile \
    .
```

## 🔍 확인 방법

### 1. 빌드 로그 확인

DigitalOcean 콘솔에서 빌드 로그를 확인:

1. **Deployments 탭** 선택
2. 최신 배포의 **Build Logs** 확인
3. 다음 메시지 확인:

**정상인 경우:**
```
=== Build arguments ===
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
=== Created .env file contents ===
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
✅ Environment variables verified successfully
```

**에러가 있는 경우:**
```
=== Build arguments ===
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=NOT_SET
❌ ERROR: VITE_GOOGLE_CLIENT_ID is not set!
❌ Please ensure VITE_GOOGLE_CLIENT_ID is set as BUILD_TIME SECRET in DigitalOcean
```

### 2. 브라우저 콘솔 확인

배포 후 브라우저 콘솔에서 확인:

**정상인 경우:**
- 에러 없음
- Google 로그인 버튼이 정상 작동

**에러가 있는 경우:**
```
VITE_GOOGLE_CLIENT_ID is not set in environment variables
```

### 3. 빌드된 파일 확인 (고급)

빌드된 JavaScript 파일에서 확인:

```bash
# 빌드된 파일에서 VITE_GOOGLE_CLIENT_ID 검색
grep -r "VITE_GOOGLE_CLIENT_ID" build/
```

**정상인 경우:**
- 빌드된 파일에 실제 클라이언트 ID 값이 포함됨

**에러가 있는 경우:**
- 빌드된 파일에 `undefined` 또는 빈 값이 포함됨

## ⚠️ 주의사항

1. **Scope 설정**
   - `VITE_GOOGLE_CLIENT_ID`는 **`BUILD_TIME`** scope로 설정해야 함
   - `RUN_TIME`으로 설정하면 빌드 시 사용할 수 없음

2. **Type 설정**
   - `VITE_GOOGLE_CLIENT_ID`는 **`SECRET`** 타입으로 설정해야 함
   - `GENERAL` 타입으로 설정해도 작동하지만 보안상 `SECRET` 권장

3. **값 확인**
   - `VITE_GOOGLE_CLIENT_ID`의 값은 `GOOGLE_CLIENT_ID`와 **정확히 동일**해야 함
   - 공백이나 특수문자 확인

4. **재배포 필요**
   - 환경 변수 변경 후 반드시 재배포 필요
   - 코드 변경 없이도 재배포 가능 (Settings > Deployments > Create Deployment)

## 📝 체크리스트

- [ ] DigitalOcean 콘솔에서 `VITE_GOOGLE_CLIENT_ID` 확인
- [ ] `VITE_GOOGLE_CLIENT_ID`의 Scope가 **`BUILD_TIME`**인지 확인
- [ ] `VITE_GOOGLE_CLIENT_ID`의 Type이 **`SECRET`**인지 확인
- [ ] `VITE_GOOGLE_CLIENT_ID`의 Value가 `GOOGLE_CLIENT_ID`와 동일한지 확인
- [ ] `app.yaml`에서 `VITE_GOOGLE_CLIENT_ID`가 `BUILD_TIME` `SECRET`으로 정의되어 있는지 확인
- [ ] 재배포 완료
- [ ] 빌드 로그에서 환경 변수 확인
- [ ] 빌드 로그에서 "✅ Environment variables verified successfully" 메시지 확인
- [ ] 브라우저 콘솔에서 에러 확인
- [ ] Google 로그인 버튼 테스트

## 🔧 문제가 계속되는 경우

### 1. 환경 변수 값 확인

1. Google Cloud Console에서 클라이언트 ID 복사
   - https://console.cloud.google.com/apis/credentials
   - OAuth 2.0 클라이언트 ID 선택
   - 클라이언트 ID 복사

2. DigitalOcean 콘솔에 정확히 붙여넣기
   - 공백이나 특수문자 확인
   - 앞뒤 공백 제거

### 2. 빌드 명령어 확인

`app.yaml`의 `build_command`에서 환경 변수 참조 확인:

```yaml
build_command: |
  docker build \
    --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
    ...
```

**주의:** `${GOOGLE_CLIENT_ID}`를 직접 참조하는 것은 작동하지 않을 수 있습니다.
`VITE_GOOGLE_CLIENT_ID`를 별도로 설정해야 합니다.

### 3. Dockerfile 확인

`Dockerfile`에서 ARG 선언 확인:

```dockerfile
ARG VITE_GOOGLE_CLIENT_ID
```

그리고 .env 파일 생성 확인:

```dockerfile
RUN echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}" >> .env
```

### 4. 수동 빌드 테스트

로컬에서 빌드 테스트:

```bash
export VITE_GOOGLE_CLIENT_ID="your-client-id-here"
docker build \
  --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
  --build-arg VITE_API_BASE_URL="https://ggfinder-app-joib6.ondigitalocean.app" \
  -t test-build \
  -f Dockerfile \
  .
```

빌드 로그에서 환경 변수가 제대로 전달되는지 확인.

## 📚 관련 문서

- `GOOGLE_CLIENT_ID_FIX.md`: 런타임 `GOOGLE_CLIENT_ID` 에러 해결
- `GOOGLE_OAUTH_SETUP.md`: Google OAuth 설정 가이드
- `DIGITALOCEAN_ENV_SETUP.md`: DigitalOcean 환경 변수 설정 가이드

