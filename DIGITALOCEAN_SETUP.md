# DigitalOcean 설정 가이드

이 문서는 DigitalOcean에서 진행해야 하는 모든 작업을 단계별로 설명합니다.

## 📋 작업 체크리스트

- [ ] 1단계: DigitalOcean API 토큰 생성
- [ ] 2단계: DigitalOcean App Platform 앱 생성
- [ ] 3단계: 환경 변수 설정
- [ ] 4단계: App ID 확인 및 GitHub Secrets 설정
- [ ] 5단계: 첫 배포 확인

---

## 1단계: DigitalOcean API 토큰 생성

GitHub Actions가 DigitalOcean에 배포할 수 있도록 API 토큰이 필요합니다.

### 작업 순서

1. **DigitalOcean 콘솔 접속**
   - [DigitalOcean API Tokens 페이지](https://cloud.digitalocean.com/account/api/tokens)로 이동
   - 또는: DigitalOcean 대시보드 > Account > API > Tokens/Keys

2. **새 토큰 생성**
   - "Generate New Token" 버튼 클릭
   - 토큰 이름 입력: `GitHub Actions Deploy` (또는 원하는 이름)
   - 권한 선택: **`Write`** (필수)
   - "Generate Token" 클릭

3. **토큰 복사 및 저장**
   - ⚠️ **중요**: 토큰은 한 번만 표시됩니다!
   - 생성된 토큰을 복사하여 안전한 곳에 저장
   - 나중에 GitHub Secrets에 추가할 예정

---

## 2단계: DigitalOcean App Platform 앱 생성

### 방법 A: 웹 콘솔 사용 (권장)

1. **앱 생성 시작**
   - [DigitalOcean Apps 페이지](https://cloud.digitalocean.com/apps)로 이동
   - "Create App" 버튼 클릭

2. **GitHub 저장소 연결**
   - "GitHub" 선택
   - GitHub 계정 인증 (처음인 경우)
   - 저장소 선택: `cvpark0920/GGFinder` (또는 본인의 저장소)
   - 브랜치 선택: `main`

3. **빌드 설정 확인**
   - ⚠️ **중요**: 빌드 타입에서 **"Docker build detected"** 선택
   - `app.yaml` 파일이 자동으로 감지되어야 함
   - Dockerfile 경로가 자동으로 설정되어야 함

4. **자동 배포 설정**
   - "Autodeploy" 옵션 활성화 (선택사항, 권장)
   - 이렇게 하면 `main` 브랜치에 푸시할 때마다 자동 배포됨

5. **리소스 생성**
   - "Create Resources" 또는 "Next" 클릭
   - 앱 생성 완료까지 대기 (약 1-2분)

### 방법 B: CLI 사용 (고급)

```bash
# doctl 설치 (macOS)
brew install doctl

# DigitalOcean 인증
doctl auth init
# 위에서 생성한 API 토큰 입력

# 앱 생성 (app.yaml 사용)
doctl apps create --spec app.yaml
```

---

## 3단계: 환경 변수 설정

앱 생성 후 환경 변수를 설정해야 합니다.

### 접속 경로

DigitalOcean 콘솔 > Apps > 생성한 앱 선택 > **Settings** > **App-Level Environment Variables**

### 설정할 환경 변수

#### 런타임 환경 변수 (Runtime) - 필수

다음 변수들을 **SECRET** 타입으로 설정:

1. **JWT_SECRET**
   - 타입: `SECRET`
   - Scope: `RUN_TIME`
   - 값: 강력한 랜덤 문자열
   - 생성 방법:
     ```bash
     openssl rand -hex 32
     ```
   - 예시: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

2. **GOOGLE_CLIENT_ID**
   - 타입: `SECRET`
   - Scope: `RUN_TIME`
   - 값: Google OAuth 클라이언트 ID
   - Google Cloud Console에서 확인

3. **GOOGLE_CLIENT_SECRET**
   - 타입: `SECRET`
   - Scope: `RUN_TIME`
   - 값: Google OAuth 클라이언트 시크릿
   - Google Cloud Console에서 확인

#### 자동 설정되는 변수

다음 변수들은 `app.yaml`에 정의되어 있어 자동으로 설정됩니다:
- `NODE_ENV`: `production`
- `PORT`: `4000`
- `DATABASE_URL`: `${db.DATABASE_URL}` (데이터베이스 연결 시 자동 생성)
- `VITE_API_BASE_URL`: `${_self.URL}` (빌드 타임, 자동 설정)
- `CORS_ORIGIN`: `${_self.URL}` (자동 설정)
- `FRONTEND_URL`: `${_self.URL}` (자동 설정)

### 환경 변수 설정 방법

1. **환경 변수 추가**
   - "Add Variable" 또는 "+" 버튼 클릭
   - Key: 변수 이름 입력 (예: `JWT_SECRET`)
   - Value: 값 입력
   - Type: `SECRET` 선택 (민감한 정보인 경우)
   - Scope: `RUN_TIME` 또는 `BUILD_TIME` 선택
   - "Save" 클릭

2. **모든 변수 확인**
   - 설정한 모든 변수가 목록에 표시되는지 확인
   - 특히 SECRET 타입 변수는 값이 `***`로 표시됨

---

## 4단계: App ID 확인 및 GitHub Secrets 설정

### App ID 확인

앱 생성 후 App ID를 확인해야 GitHub Secrets에 추가할 수 있습니다.

#### 방법 1: DigitalOcean 콘솔에서 확인

1. Apps 페이지에서 생성한 앱 클릭
2. URL에서 확인: `https://cloud.digitalocean.com/apps/[APP_ID]`
3. 또는 Settings > General에서 확인

#### 방법 2: CLI로 확인

```bash
doctl apps list
```

출력 예시:
```
ID                                      Spec Name    Default Ingress    Active Deployment    In Progress Deployment
12345678-1234-1234-1234-123456789abc    ggfinder     ...
```

### GitHub Secrets 설정

GitHub 저장소에 다음 Secrets를 추가합니다:

1. **GitHub 저장소 접속**
   - 저장소로 이동: `https://github.com/cvpark0920/GGFinder`
   - Settings > Secrets and variables > Actions

2. **Secrets 추가**

   **필수 Secrets:**
   
   - **DIGITALOCEAN_ACCESS_TOKEN**
     - Value: 1단계에서 생성한 API 토큰
   
   - **DIGITALOCEAN_APP_ID**
     - Value: 위에서 확인한 App ID
   
   **선택적 Secrets:**
   
   - **VITE_API_BASE_URL** (선택사항)
     - Value: 앱 URL (예: `https://your-app.ondigitalocean.app`)
     - 앱 생성 후 URL 확인 가능

3. **Secrets 확인**
   - 모든 Secrets가 목록에 표시되는지 확인
   - 값은 `***`로 표시되어 보안이 유지됨

---

## 5단계: 첫 배포 확인

### 자동 배포 (Autodeploy 활성화한 경우)

1. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **GitHub Actions 확인**
   - GitHub 저장소 > Actions 탭
   - "Deploy to DigitalOcean" 워크플로우 실행 확인
   - 각 단계별 진행 상황 모니터링

3. **DigitalOcean 배포 확인**
   - DigitalOcean 콘솔 > Apps > 앱 선택
   - "Deployments" 탭에서 배포 상태 확인
   - 배포가 완료될 때까지 대기 (약 5-10분)

### 수동 배포

Autodeploy를 비활성화한 경우:

1. **GitHub Actions에서 수동 실행**
   - Actions 탭 > "Deploy to DigitalOcean" 워크플로우 선택
   - "Run workflow" 클릭
   - 브랜치 선택: `main`
   - "Run workflow" 클릭

2. **DigitalOcean 콘솔에서 수동 배포**
   - Apps > 앱 선택
   - "Actions" > "Create Deployment" 클릭

### 배포 확인

1. **앱 상태 확인**
   - DigitalOcean 콘솔에서 앱 상태가 "Live"인지 확인
   - 헬스 체크가 통과했는지 확인

2. **앱 URL 접속**
   - 앱 URL로 브라우저 접속
   - 예: `https://ggfinder-xxxxx.ondigitalocean.app`
   - 헬스 체크: `https://ggfinder-xxxxx.ondigitalocean.app/health`

3. **로그 확인**
   ```bash
   # 배포 로그
   doctl apps logs <APP_ID> --type build
   
   # 런타임 로그
   doctl apps logs <APP_ID> --type run
   ```

---

## 🔍 확인 사항

### 앱 생성 확인

- [ ] 앱이 정상적으로 생성됨
- [ ] 데이터베이스가 자동으로 생성되고 연결됨
- [ ] 앱 URL이 할당됨

### 환경 변수 확인

- [ ] `JWT_SECRET` 설정됨 (SECRET 타입)
- [ ] `GOOGLE_CLIENT_ID` 설정됨 (SECRET 타입)
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨 (SECRET 타입)
- [ ] 자동 설정 변수들이 올바르게 설정됨

### GitHub Secrets 확인

- [ ] `DIGITALOCEAN_ACCESS_TOKEN` 설정됨
- [ ] `DIGITALOCEAN_APP_ID` 설정됨
- [ ] `VITE_API_BASE_URL` 설정됨 (선택사항)

### 배포 확인

- [ ] GitHub Actions 워크플로우가 성공적으로 실행됨
- [ ] DigitalOcean에서 배포가 완료됨
- [ ] 앱이 정상적으로 작동함
- [ ] 헬스 체크 엔드포인트가 응답함

---

## 🆘 문제 해결

### 앱 생성 실패

- GitHub 저장소 연결 확인
- `app.yaml` 파일이 저장소에 있는지 확인
- Dockerfile이 올바른 위치에 있는지 확인

### 환경 변수 문제

- 모든 필수 변수가 설정되었는지 확인
- SECRET 타입 변수가 올바르게 설정되었는지 확인
- 변수 이름의 대소문자 확인

### 배포 실패

- GitHub Actions 로그 확인
- DigitalOcean 빌드 로그 확인
- 환경 변수 재확인
- 데이터베이스 연결 확인

### 자세한 트러블슈팅

[DEPLOYMENT.md](./DEPLOYMENT.md)의 트러블슈팅 섹션을 참조하세요.

---

## 📚 추가 리소스

- [DigitalOcean App Platform 문서](https://docs.digitalocean.com/products/app-platform/)
- [doctl CLI 문서](https://docs.digitalocean.com/reference/doctl/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

