# 프론트엔드 에러 해결 가이드

## 발생한 에러

### 1. VITE_GOOGLE_CLIENT_ID 에러
```
VITE_GOOGLE_CLIENT_ID is not set in environment variables
```

**원인**: 빌드 타임 환경 변수가 설정되지 않음

**해결**: `app.yaml`에 빌드 타임 환경 변수 추가 완료

### 2. CORS 에러
```
Access to fetch at 'http://localhost:4000/api/youtube/public' from origin 
'https://ggfinder-app-joib6.ondigitalocean.app' has been blocked by CORS policy
```

**원인**: 서버의 CORS 설정이 localhost를 가리키고 있음

**해결**: 서버 코드 수정 완료 (CORS_ORIGIN 환경 변수 우선 사용)

## 수정 사항

### 1. Dockerfile 수정
- `VITE_GOOGLE_CLIENT_ID` 빌드 타임 ARG 추가
- 빌드 시 Google Client ID를 프론트엔드에 포함

### 2. app.yaml 수정
- `VITE_GOOGLE_CLIENT_ID` 빌드 타임 환경 변수 추가
- `GOOGLE_CLIENT_ID` 값을 빌드 타임에 전달

### 3. server/index.ts 수정
- CORS 설정에서 `CORS_ORIGIN` 환경 변수 우선 사용
- `FRONTEND_URL`을 대체값으로 사용

## 다음 단계

### 1. 코드 커밋 및 푸시
```bash
git add .
git commit -m "Fix frontend errors: Add VITE_GOOGLE_CLIENT_ID and fix CORS"
git push origin main
```

### 2. DigitalOcean에서 확인

#### 환경 변수 확인 및 설정
1. DigitalOcean 콘솔 > Apps > 앱 선택
2. Settings > App-Level Environment Variables
3. 다음 변수들이 설정되어 있는지 확인:

   **런타임 환경 변수 (RUN_TIME):**
   - `GOOGLE_CLIENT_ID` (SECRET 타입) - Google OAuth 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET` (SECRET 타입)
   - `JWT_SECRET` (SECRET 타입)
   - `CORS_ORIGIN` (${_self.URL})
   - `FRONTEND_URL` (${_self.URL})

   **빌드 타임 환경 변수 (BUILD_TIME):**
   - `VITE_API_BASE_URL` (${_self.URL}) - 자동 설정됨
   - `VITE_GOOGLE_CLIENT_ID` (SECRET 타입) - ⚠️ **수동 설정 필요**
     - `GOOGLE_CLIENT_ID`와 **동일한 값**으로 설정
     - 빌드 타임에 프론트엔드 코드에 포함됨

4. **VITE_GOOGLE_CLIENT_ID 설정 방법:**
   - "Add Variable" 클릭
   - Key: `VITE_GOOGLE_CLIENT_ID`
   - Value: `GOOGLE_CLIENT_ID`와 동일한 값 입력
   - Type: `SECRET` 선택
   - Scope: `BUILD_TIME` 선택
   - "Save" 클릭

#### 재배포
- GitHub에 푸시하면 자동 배포됨
- 또는 DigitalOcean 콘솔에서 수동 배포:
  - Actions > Create Deployment

### 3. 배포 후 확인

#### 빌드 로그 확인
```bash
doctl apps logs <APP_ID> --type build | grep VITE
```

다음과 같이 표시되어야 함:
```
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

#### 런타임 로그 확인
```bash
doctl apps logs <APP_ID> --type run | grep CORS
```

#### 브라우저에서 확인
1. 앱 URL 접속: `https://ggfinder-app-joib6.ondigitalocean.app`
2. 브라우저 콘솔에서 에러 확인
3. Google 로그인 버튼이 정상 작동하는지 확인
4. API 호출이 정상 작동하는지 확인

## 예상 결과

### 정상 작동 시
- ✅ Google 로그인 버튼이 표시됨
- ✅ API 호출이 정상 작동함
- ✅ CORS 에러가 발생하지 않음
- ✅ 브라우저 콘솔에 에러가 없음

### 여전히 문제가 있는 경우

#### VITE_GOOGLE_CLIENT_ID 에러가 계속 발생하는 경우
1. DigitalOcean에서 `GOOGLE_CLIENT_ID` 환경 변수가 설정되어 있는지 확인
2. 빌드 로그에서 환경 변수가 전달되는지 확인
3. 앱을 완전히 재배포 (기존 빌드 캐시 제거)

#### CORS 에러가 계속 발생하는 경우
1. `CORS_ORIGIN` 환경 변수가 `${_self.URL}`로 설정되어 있는지 확인
2. 런타임 로그에서 실제 CORS origin 확인:
   ```bash
   doctl apps logs <APP_ID> --type run | grep origin
   ```
3. 서버가 재시작되었는지 확인 (환경 변수 변경 후 재시작 필요)

## 추가 확인 사항

### 환경 변수 우선순위
서버의 CORS 설정은 다음 순서로 환경 변수를 확인합니다:
1. `CORS_ORIGIN` (우선)
2. `FRONTEND_URL` (대체)
3. `http://localhost:4001` (기본값)

### 빌드 타임 vs 런타임
- **빌드 타임**: `VITE_*` 변수들은 빌드 시 프론트엔드 코드에 포함됨
- **런타임**: `GOOGLE_CLIENT_ID` 등은 서버에서만 사용됨

## 트러블슈팅

### 문제: 환경 변수가 설정되었지만 여전히 에러 발생

**해결책**:
1. 앱을 완전히 재배포 (기존 빌드 캐시 제거)
2. 빌드 로그에서 환경 변수 전달 확인
3. 브라우저 캐시 삭제 후 재시도

### 문제: CORS 에러가 계속 발생

**해결책**:
1. `CORS_ORIGIN` 환경 변수가 올바른 URL로 설정되었는지 확인
2. 서버가 재시작되었는지 확인
3. 브라우저 개발자 도구에서 실제 요청 헤더 확인

