# DigitalOcean 환경 변수 설정 가이드

## 🔍 문제 원인

빌드 로그에서 확인된 문제:
- `VITE_API_BASE_URL`이 빌드 환경에 설정되지 않음
- `VITE_GOOGLE_CLIENT_ID`만 설정됨
- 결과: 프론트엔드가 `http://localhost:4000`을 사용

## ✅ 해결 방법

### 방법 1: DigitalOcean 콘솔에서 직접 설정 (권장)

1. DigitalOcean 콘솔 접속
   - https://cloud.digitalocean.com/apps
   - 앱 선택 > Settings > App-Level Environment Variables

2. 다음 환경 변수 추가/수정:

   **VITE_API_BASE_URL**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://ggfinder-app-joib6.ondigitalocean.app` (실제 앱 URL)
   - Scope: `BUILD_TIME`
   - Type: `GENERAL` (SECRET 아님)

   **VITE_GOOGLE_CLIENT_ID**
   - Key: `VITE_GOOGLE_CLIENT_ID`
   - Value: `GOOGLE_CLIENT_ID`와 동일한 값
   - Scope: `BUILD_TIME`
   - Type: `SECRET`

3. 저장 후 재배포
   - Settings > Deployments > Create Deployment
   - 또는 코드 푸시 시 자동 재배포

### 방법 2: app.yaml 수정 (대안)

`app.yaml`에서 `value: ${_self.URL}` 대신 실제 URL을 사용:

```yaml
- key: VITE_API_BASE_URL
  scope: BUILD_TIME
  value: https://ggfinder-app-joib6.ondigitalocean.app
```

하지만 이 방법은 URL이 변경되면 수동으로 업데이트해야 함.

## 🔍 확인 방법

### 빌드 로그 확인

재배포 후 빌드 로그에서 다음을 확인:

```
› configuring build-time app environment variables:
    VITE_API_BASE_URL
    VITE_GOOGLE_CLIENT_ID
```

그리고 Dockerfile의 RUN 단계에서:

```
=== Checking build environment variables ===
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

### 런타임 로그 확인

배포 후 런타임 로그에서 CORS 설정 확인:

```bash
doctl apps logs <APP_ID> --type run | grep CORS
```

예상 출력:
```
CORS_ORIGIN: https://ggfinder-app-joib6.ondigitalocean.app
Allowed Origin: https://ggfinder-app-joib6.ondigitalocean.app
```

## ⚠️ 주의사항

1. **환경 변수 타입**
   - `VITE_API_BASE_URL`: `GENERAL` 타입 (SECRET 아님)
   - `VITE_GOOGLE_CLIENT_ID`: `SECRET` 타입

2. **Scope 설정**
   - 두 변수 모두 `BUILD_TIME` scope로 설정해야 함
   - `RUN_TIME`으로 설정하면 빌드 시 사용 불가

3. **재배포 필요**
   - 환경 변수 변경 후 반드시 재배포 필요
   - 코드 변경 없이도 재배포 가능 (Settings > Deployments)

## 📝 체크리스트

- [ ] DigitalOcean 콘솔에서 `VITE_API_BASE_URL` 설정 확인
- [ ] `VITE_API_BASE_URL`의 Scope가 `BUILD_TIME`인지 확인
- [ ] `VITE_API_BASE_URL`의 Value가 실제 앱 URL인지 확인
- [ ] `VITE_GOOGLE_CLIENT_ID`가 `BUILD_TIME` SECRET으로 설정되어 있는지 확인
- [ ] 재배포 완료
- [ ] 빌드 로그에서 환경 변수 확인
- [ ] 브라우저에서 CORS 에러 해결 확인
