# Google OAuth redirect_uri 에러 해결 가이드

## 🔍 문제 원인

에러: "Missing required parameter: redirect_uri"

원인:
- `GOOGLE_REDIRECT_URI` 환경 변수가 DigitalOcean에 설정되지 않음
- 서버가 기본값 `http://localhost:4000/api/auth/google/callback`을 사용
- 프로덕션 환경에서는 실제 앱 URL을 사용해야 함

## ✅ 해결 방법

### 1. app.yaml에 환경 변수 추가 (완료)

`app.yaml`에 다음 환경 변수가 추가되었습니다:

```yaml
- key: GOOGLE_REDIRECT_URI
  scope: RUN_TIME
  value: ${_self.URL}/api/auth/google/callback
```

이렇게 하면:
- `${_self.URL}`이 실제 앱 URL로 해석됨
- 예: `https://ggfinder-app-joib6.ondigitalocean.app/api/auth/google/callback`

### 2. Google Cloud Console에서 리디렉션 URI 확인

Google Cloud Console에서 다음 URI가 승인된 리디렉션 URI로 설정되어 있어야 합니다:

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/apis/credentials
   - OAuth 2.0 클라이언트 ID 선택

2. **승인된 리디렉션 URI 확인/추가**
   - 다음 URI가 추가되어 있어야 함:
     ```
     https://ggfinder-app-joib6.ondigitalocean.app/api/auth/google/callback
     ```
   - 로컬 개발용 (이미 있을 수 있음):
     ```
     http://localhost:4000/api/auth/google/callback
     ```

3. **저장**
   - 변경사항 저장
   - 설정 적용까지 몇 분 걸릴 수 있음

### 3. DigitalOcean 콘솔에서 확인 (선택사항)

`app.yaml`에 추가했지만, DigitalOcean 콘솔에서도 확인할 수 있습니다:

1. DigitalOcean 콘솔 접속
   - https://cloud.digitalocean.com/apps
   - 앱 선택 > Settings > App-Level Environment Variables

2. `GOOGLE_REDIRECT_URI` 확인
   - Key: `GOOGLE_REDIRECT_URI`
   - Value: `https://ggfinder-app-joib6.ondigitalocean.app/api/auth/google/callback`
   - Scope: `RUN_TIME`

## 🔍 확인 방법

### 1. 재배포 후 런타임 로그 확인

```bash
doctl apps logs <APP_ID> --type run | grep GOOGLE_REDIRECT_URI
```

예상 출력:
```
GOOGLE_REDIRECT_URI=https://ggfinder-app-joib6.ondigitalocean.app/api/auth/google/callback
```

### 2. 서버 코드에서 확인

`server/routes/auth.ts`의 OAuth2Client 초기화 부분:
```typescript
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'
);
```

`process.env.GOOGLE_REDIRECT_URI`가 프로덕션 URL로 설정되어 있어야 합니다.

### 3. 브라우저에서 테스트

1. Google 로그인 버튼 클릭
2. Google 인증 페이지로 리디렉션되는지 확인
3. "Missing required parameter: redirect_uri" 에러가 사라졌는지 확인

## ⚠️ 주의사항

1. **Google Cloud Console 설정**
   - 리디렉션 URI가 Google Cloud Console에 등록되어 있어야 함
   - 등록되지 않은 URI는 Google이 거부함

2. **환경 변수 순서**
   - `GOOGLE_REDIRECT_URI`는 `RUN_TIME` scope로 설정
   - 서버 시작 시 환경 변수로 사용됨

3. **재배포 필요**
   - `app.yaml` 변경 후 반드시 재배포 필요
   - 코드 푸시 시 자동 재배포됨

## 📝 체크리스트

- [ ] `app.yaml`에 `GOOGLE_REDIRECT_URI` 추가됨
- [ ] Google Cloud Console에 프로덕션 리디렉션 URI 추가됨
- [ ] 재배포 완료
- [ ] 런타임 로그에서 `GOOGLE_REDIRECT_URI` 확인
- [ ] 브라우저에서 Google 로그인 테스트
- [ ] "Missing required parameter: redirect_uri" 에러 해결 확인

