# GitHub Secrets - DigitalOcean 설정 가이드

## 🔍 DIGITALOCEAN_APP_ID 찾기

### 방법 1: DigitalOcean 콘솔에서 확인 (가장 쉬움)

1. **DigitalOcean 콘솔 접속**
   - https://cloud.digitalocean.com/apps
   - 또는 직접 앱 URL: https://cloud.digitalocean.com/apps/ggfinder-app-joib6

2. **앱 선택**
   - `ggfinder` 앱 클릭

3. **App ID 확인**
   - 방법 A: URL에서 확인
     - URL: `https://cloud.digitalocean.com/apps/[APP_ID]`
     - 예: `https://cloud.digitalocean.com/apps/12345678-1234-1234-1234-123456789abc`
     - `12345678-1234-1234-1234-123456789abc` 부분이 App ID입니다
   
   - 방법 B: Settings에서 확인
     - Settings > General 탭
     - "App ID" 또는 "ID" 필드에서 확인

### 방법 2: doctl CLI로 확인

```bash
# doctl 설치 (아직 안 했다면)
brew install doctl

# DigitalOcean 인증
doctl auth init

# 앱 목록 확인
doctl apps list
```

출력 예시:
```
ID                                      Spec Name    Default Ingress    Active Deployment
12345678-1234-1234-1234-123456789abc    ggfinder     ...
```

첫 번째 컬럼의 값이 App ID입니다.

### 방법 3: 앱 URL에서 추정

앱 URL이 `https://ggfinder-app-joib6.ondigitalocean.app`인 경우:
- App ID는 보통 UUID 형식입니다 (예: `12345678-1234-1234-1234-123456789abc`)
- URL의 `ggfinder-app-joib6` 부분은 App ID가 아닙니다
- 반드시 DigitalOcean 콘솔에서 확인해야 합니다

## 📋 GitHub Secrets 설정

### 1. GitHub 저장소 접속

1. **GitHub 저장소로 이동**
   - https://github.com/cvpark0920/GGFinder
   - Settings > Secrets and variables > Actions

2. **"New repository secret" 클릭**

### 2. 필수 Secrets 추가

#### DIGITALOCEAN_ACCESS_TOKEN

1. **DigitalOcean API 토큰 생성** (아직 안 했다면)
   - https://cloud.digitalocean.com/account/api/tokens
   - "Generate New Token" 클릭
   - 이름: `GitHub Actions Deploy`
   - 권한: **`Write`** 선택
   - "Generate Token" 클릭
   - ⚠️ 토큰을 복사하여 안전한 곳에 저장 (한 번만 표시됨)

2. **GitHub Secret 추가**
   - Name: `DIGITALOCEAN_ACCESS_TOKEN`
   - Secret: 위에서 생성한 API 토큰
   - Add secret

#### DIGITALOCEAN_APP_ID

1. **App ID 확인** (위의 방법 사용)

2. **GitHub Secret 추가**
   - Name: `DIGITALOCEAN_APP_ID`
   - Secret: 확인한 App ID (예: `12345678-1234-1234-1234-123456789abc`)
   - Add secret

### 3. 선택적 Secrets 추가

#### VITE_API_BASE_URL (선택사항)

- Name: `VITE_API_BASE_URL`
- Secret: `https://ggfinder-app-joib6.ondigitalocean.app`
- Add secret

#### VITE_GOOGLE_CLIENT_ID (선택사항, 권장)

- Name: `VITE_GOOGLE_CLIENT_ID`
- Secret: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`
- Add secret

## 🔍 확인 방법

### 1. GitHub Secrets 목록 확인

GitHub 저장소 > Settings > Secrets and variables > Actions에서 다음 Secrets가 있는지 확인:

- ✅ `DIGITALOCEAN_ACCESS_TOKEN`
- ✅ `DIGITALOCEAN_APP_ID`
- (선택) `VITE_API_BASE_URL`
- (선택) `VITE_GOOGLE_CLIENT_ID`

### 2. GitHub Actions에서 테스트

1. **워크플로우 수동 실행**
   - Actions 탭 > "Deploy to DigitalOcean" 워크플로우 선택
   - "Run workflow" 클릭
   - 브랜치: `main` 선택
   - "Run workflow" 클릭

2. **빌드 로그 확인**
   - 워크플로우 실행 선택
   - "Verify App ID" 단계 확인
   - 다음 메시지가 보여야 함:
     ```
     ✅ App ID is set
     ```

3. **에러가 없는지 확인**
   - "Deploy to DigitalOcean App Platform" 단계가 성공하는지 확인
   - 배포가 시작되는지 확인

## ⚠️ 주의사항

1. **App ID 형식**
   - App ID는 UUID 형식입니다 (예: `12345678-1234-1234-1234-123456789abc`)
   - 하이픈(`-`)이 포함되어 있습니다
   - 대소문자 구분 없습니다

2. **Secret 이름**
   - 정확히 `DIGITALOCEAN_APP_ID`로 입력해야 합니다
   - 대소문자 구분합니다

3. **토큰 권한**
   - `DIGITALOCEAN_ACCESS_TOKEN`은 반드시 `Write` 권한이 있어야 합니다
   - `Read` 권한만으로는 배포할 수 없습니다

## 🔧 문제 해결

### "DIGITALOCEAN_APP_ID secret is not set" 에러

**원인:**
- GitHub Secrets에 `DIGITALOCEAN_APP_ID`가 설정되지 않음

**해결:**
1. GitHub 저장소 > Settings > Secrets and variables > Actions 확인
2. `DIGITALOCEAN_APP_ID` Secret이 있는지 확인
3. 없으면 위의 방법으로 추가

### "DIGITALOCEAN_ACCESS_TOKEN secret is not set" 에러

**원인:**
- GitHub Secrets에 `DIGITALOCEAN_ACCESS_TOKEN`이 설정되지 않음

**해결:**
1. DigitalOcean에서 API 토큰 생성
2. GitHub Secrets에 추가

### "App not found" 에러

**원인:**
- App ID가 잘못되었거나 앱이 삭제됨

**해결:**
1. DigitalOcean 콘솔에서 앱이 존재하는지 확인
2. App ID를 다시 확인하여 GitHub Secret 업데이트

## 📝 체크리스트

- [ ] DigitalOcean 콘솔에서 App ID 확인
- [ ] GitHub Secrets에 `DIGITALOCEAN_ACCESS_TOKEN` 추가
- [ ] GitHub Secrets에 `DIGITALOCEAN_APP_ID` 추가
- [ ] (선택) GitHub Secrets에 `VITE_API_BASE_URL` 추가
- [ ] (선택) GitHub Secrets에 `VITE_GOOGLE_CLIENT_ID` 추가
- [ ] GitHub Actions에서 워크플로우 테스트
- [ ] "✅ App ID is set" 메시지 확인
- [ ] 배포가 성공적으로 시작되는지 확인

