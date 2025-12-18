# Google OAuth client_id 에러 해결 가이드

## 🔍 문제 원인

에러: "Missing required parameter: client_id"

원인:
- `GOOGLE_CLIENT_ID` 환경 변수가 DigitalOcean에 설정되지 않았거나
- 환경 변수가 설정되었지만 서버가 재시작되지 않았거나
- 환경 변수가 `SECRET` 타입으로 설정되지 않았을 수 있음

## ✅ 해결 방법

### 1. DigitalOcean 콘솔에서 환경 변수 확인

1. **DigitalOcean 콘솔 접속**
   - https://cloud.digitalocean.com/apps
   - 앱 선택 > Settings > App-Level Environment Variables

2. **GOOGLE_CLIENT_ID 확인**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Google OAuth 클라이언트 ID (예: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`)
   - Scope: `RUN_TIME` (중요!)
   - Type: `SECRET` (중요!)

3. **GOOGLE_CLIENT_SECRET 확인**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: Google OAuth 클라이언트 시크릿
   - Scope: `RUN_TIME` (중요!)
   - Type: `SECRET` (중요!)

### 2. 환경 변수가 없는 경우 추가

1. **환경 변수 추가**
   - "Add Variable" 버튼 클릭
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Google OAuth 클라이언트 ID 입력
   - Scope: `RUN_TIME` 선택
   - Type: `SECRET` 선택
   - 저장

2. **GOOGLE_CLIENT_SECRET도 동일하게 추가**

### 3. 재배포

환경 변수를 추가/수정한 후:
- Settings > Deployments > Create Deployment
- 또는 코드 푸시 시 자동 재배포

## 🔍 확인 방법

### 1. 런타임 로그 확인

재배포 후 런타임 로그에서 확인:

```bash
doctl apps logs <APP_ID> --type run | grep GOOGLE_CLIENT_ID
```

**정상인 경우:**
- 로그에 에러가 없어야 함
- 서버가 정상적으로 시작되어야 함

**에러가 있는 경우:**
```
⚠️ ERROR: GOOGLE_CLIENT_ID is not set!
⚠️ CRITICAL: Google OAuth credentials are missing!
GOOGLE_CLIENT_ID: NOT SET
```

### 2. 서버 코드에서 확인

`server/routes/auth.ts`에서 환경 변수 검증 로그가 추가되었습니다:

```typescript
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('⚠️ ERROR: GOOGLE_CLIENT_ID is not set!');
}
```

### 3. 브라우저에서 테스트

1. Google 로그인 버튼 클릭
2. "Missing required parameter: client_id" 에러가 사라졌는지 확인
3. Google 인증 페이지로 정상적으로 리디렉션되는지 확인

## ⚠️ 주의사항

1. **Scope 설정**
   - `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`은 `RUN_TIME` scope로 설정해야 함
   - `BUILD_TIME`으로 설정하면 런타임에 사용할 수 없음

2. **Type 설정**
   - 두 변수 모두 `SECRET` 타입으로 설정해야 함
   - `GENERAL` 타입으로 설정하면 보안 문제가 발생할 수 있음

3. **재배포 필요**
   - 환경 변수 변경 후 반드시 재배포 필요
   - 코드 변경 없이도 재배포 가능 (Settings > Deployments)

4. **Google Cloud Console 확인**
   - Google Cloud Console에서도 클라이언트 ID가 활성화되어 있는지 확인
   - https://console.cloud.google.com/apis/credentials

## 📝 체크리스트

- [ ] DigitalOcean 콘솔에서 `GOOGLE_CLIENT_ID` 확인
- [ ] `GOOGLE_CLIENT_ID`의 Scope가 `RUN_TIME`인지 확인
- [ ] `GOOGLE_CLIENT_ID`의 Type이 `SECRET`인지 확인
- [ ] `GOOGLE_CLIENT_ID`의 Value가 올바른지 확인
- [ ] `GOOGLE_CLIENT_SECRET`도 동일하게 확인
- [ ] 재배포 완료
- [ ] 런타임 로그에서 에러 확인
- [ ] 브라우저에서 Google 로그인 테스트
- [ ] "Missing required parameter: client_id" 에러 해결 확인

## 🔧 문제가 계속되는 경우

1. **환경 변수 값 확인**
   - Google Cloud Console에서 클라이언트 ID 복사
   - DigitalOcean 콘솔에 정확히 붙여넣기
   - 공백이나 특수문자 확인

2. **서버 재시작**
   - DigitalOcean 콘솔에서 앱 재시작
   - 또는 새로운 배포 생성

3. **로그 확인**
   - 런타임 로그에서 환경 변수 관련 에러 확인
   - 서버 시작 시 로그 확인

