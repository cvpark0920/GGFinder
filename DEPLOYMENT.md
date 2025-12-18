# DigitalOcean 배포 가이드

이 문서는 GitHub CI/CD를 사용하여 DigitalOcean App Platform에 배포하는 방법을 설명합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [DigitalOcean 설정](#digitalocean-설정)
3. [GitHub 설정](#github-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 절차](#배포-절차)
6. [트러블슈팅](#트러블슈팅)
7. [Docker vs Node.js 빌드 선택](#docker-vs-nodejs-빌드-선택)

## 사전 준비사항

- DigitalOcean 계정
- GitHub 저장소
- DigitalOcean API 토큰
- 필요한 환경 변수 목록

## Docker 빌드 사용

✅ **이 프로젝트는 Docker 빌드를 사용합니다.**

`app.yaml`에 `dockerfile_path: Dockerfile`이 설정되어 있어 Docker 빌드가 사용됩니다.

### Docker 빌드의 장점

- **일관된 환경**: 로컬과 프로덕션 환경이 동일
- **멀티 스테이지 빌드**: 최적화된 이미지 크기
- **의존성 격리**: 빌드 환경이 명확하게 정의됨
- **재현 가능한 빌드**: Dockerfile로 빌드 과정이 문서화됨

### 빌드 프로세스

1. **Builder 스테이지**: 모든 의존성 설치 및 빌드
2. **Production 스테이지**: 프로덕션 의존성만 포함하는 최적화된 이미지
3. **마이그레이션 및 서버 시작**: 컨테이너 시작 시 Prisma 마이그레이션 실행 후 서버 시작

## DigitalOcean 설정

### 1. DigitalOcean App Platform 앱 생성

#### 방법 A: DigitalOcean 웹 콘솔 사용 (권장)

1. [DigitalOcean 콘솔](https://cloud.digitalocean.com/apps)에 로그인
2. "Create App" 클릭
3. "GitHub" 선택하여 저장소 연결
4. 저장소 선택: `cvpark0920/GGFinder` (또는 본인의 저장소)
5. 브랜치 선택: `main`
6. **중요**: 빌드 타입 선택 시 **"Docker build detected"** 선택
7. "Autodeploy" 활성화 (선택사항)
8. `app.yaml` 파일이 자동으로 감지됩니다 (Dockerfile 경로가 설정됨)
9. 환경 변수 설정 (아래 [환경 변수 설정](#환경-변수-설정) 참조)
10. "Create Resources" 클릭하여 앱 생성

#### 방법 B: doctl CLI 사용 (app.yaml 자동 적용)

```bash
# doctl 설치 (macOS)
brew install doctl

# DigitalOcean 인증
doctl auth init

# 앱 생성 (app.yaml 사용 - 자동으로 Node.js 빌드 선택됨)
doctl apps create --spec app.yaml
```

### 2. App ID 확인

앱 생성 후 App ID를 확인합니다:

```bash
doctl apps list
```

또는 DigitalOcean 콘솔에서 앱 상세 페이지의 URL에서 확인할 수 있습니다.

## GitHub 설정

### 1. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 Secrets를 추가합니다:

#### 필수 Secrets

- `DIGITALOCEAN_ACCESS_TOKEN`: DigitalOcean API 토큰
- `DIGITALOCEAN_APP_ID`: DigitalOcean App Platform 앱 ID
- `VITE_API_BASE_URL`: 프론트엔드 API 기본 URL (예: `https://your-app.ondigitalocean.app`)

#### Secrets 추가 방법

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭
4. 각 Secret 추가:

```
DIGITALOCEAN_ACCESS_TOKEN: your_do_token_here
DIGITALOCEAN_APP_ID: your_app_id_here
VITE_API_BASE_URL: https://your-app.ondigitalocean.app
```

### 2. DigitalOcean API 토큰 생성

1. [DigitalOcean API Tokens 페이지](https://cloud.digitalocean.com/account/api/tokens)로 이동
2. "Generate New Token" 클릭
3. 토큰 이름 입력 (예: "GitHub Actions Deploy")
4. "Write" 권한 선택
5. "Generate Token" 클릭
6. 생성된 토큰을 복사하여 GitHub Secret에 추가

## 환경 변수 설정

### DigitalOcean App Platform에서 환경 변수 설정

DigitalOcean 콘솔에서 앱 > Settings > App-Level Environment Variables에서 다음 변수들을 설정합니다:

#### 런타임 환경 변수 (Runtime)

```
NODE_ENV=production
PORT=4000
DATABASE_URL=${db.DATABASE_URL}
JWT_SECRET=<your-jwt-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
CORS_ORIGIN=${_self.URL}
FRONTEND_URL=${_self.URL}
```

#### 빌드 타임 환경 변수 (Build Time)

```
VITE_API_BASE_URL=${_self.URL}
```

### 환경 변수 설명

- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 문자열 (자동 생성됨)
- `JWT_SECRET`: JWT 토큰 서명에 사용할 비밀 키
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `VITE_API_BASE_URL`: 프론트엔드 빌드 시 사용할 API 기본 URL
- `${_self.URL}`: DigitalOcean이 자동으로 제공하는 앱 URL
- `${db.DATABASE_URL}`: 연결된 데이터베이스의 연결 문자열

## 배포 절차

### 자동 배포 (GitHub Actions 사용)

1. **main 브랜치에 푸시**
   ```bash
   git add .
   git commit -m "Deploy to DigitalOcean"
   git push origin main
   ```

2. **GitHub Actions 확인**
   - GitHub 저장소의 "Actions" 탭으로 이동
   - 워크플로우 실행 상태 확인
   - 배포 완료까지 대기 (약 5-10분)

3. **배포 상태 확인**
   ```bash
   doctl apps list-deployments <APP_ID>
   ```

### 수동 배포

수동으로 배포하려면:

```bash
# GitHub Actions에서 "Deploy to DigitalOcean (Alternative - Manual)" 워크플로우 실행
# 또는 직접 doctl 사용
doctl apps create-deployment <APP_ID> --wait
```

### 배포 확인

배포가 완료되면:

1. DigitalOcean 콘솔에서 앱 상태 확인
2. 앱 URL로 접속하여 정상 작동 확인
3. 로그 확인:
   ```bash
   doctl apps logs <APP_ID> --type run
   ```

## GitHub Actions CI/CD 파이프라인

### 워크플로우 개요

이 프로젝트는 세 가지 GitHub Actions 워크플로우를 사용합니다:

1. **CI 워크플로우** (`.github/workflows/ci.yml`): 코드 품질 검증 및 빌드 테스트
2. **Docker 빌드 테스트** (`.github/workflows/docker-build-test.yml`): 독립적인 Docker 빌드 검증
3. **배포 워크플로우** (`.github/workflows/deploy.yml`): DigitalOcean 자동 배포

### CI 워크플로우 (`.github/workflows/ci.yml`)

PR 생성 또는 `main` 브랜치 푸시 시 자동 실행:

1. **Lint and Test 단계**:
   - 코드 체크아웃
   - Node.js 설정
   - 의존성 설치
   - Prisma 클라이언트 생성 및 스키마 검증
   - 프론트엔드 빌드
   - 서버 빌드
   - 빌드 결과 검증

2. **Docker Build Test 단계**:
   - Docker Buildx 설정
   - Docker 이미지 빌드 (빌드 타임 환경 변수 포함)
   - 이미지 검증 및 크기 확인
   - 빌드 캐시 활용

### Docker 빌드 테스트 워크플로우 (`.github/workflows/docker-build-test.yml`)

독립적인 Docker 빌드 검증 워크플로우:

- PR 생성 시 자동 실행
- 수동 실행 가능 (`workflow_dispatch`)
- Docker 이미지 구조 검증
- 필수 파일 존재 확인
- 헬스 체크 설정 확인

**실행 방법:**
```bash
# GitHub Actions 탭에서 수동 실행
# 또는 PR 생성 시 자동 실행
```

### 배포 워크플로우 (`.github/workflows/deploy.yml`)

`main` 브랜치 푸시 시 자동 실행:

1. **Test 단계**:
   - 코드 체크아웃
   - Node.js 설정
   - 의존성 설치
   - Prisma 클라이언트 생성 및 스키마 검증
   - 프론트엔드 빌드
   - 서버 빌드
   - 빌드 결과 검증

2. **Docker Build Verification 단계**:
   - Docker Buildx 설정
   - Docker 이미지 빌드 검증
   - 이미지 구조 확인
   - 필수 파일 존재 확인
   - 배포 전 최종 검증

3. **Deploy 단계**:
   - DigitalOcean CLI 설정
   - App ID 검증
   - DigitalOcean App Platform에 배포 트리거
   - 배포 상태 모니터링
   - 배포 완료 확인

### CI/CD 파이프라인 흐름

```
코드 푸시/PR 생성
    ↓
┌─────────────────────────────────────┐
│ CI 워크플로우 실행                  │
│ - Node.js 빌드 테스트               │
│ - Docker 빌드 테스트                │
│ - Prisma 스키마 검증                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Docker 빌드 테스트 워크플로우       │
│ (PR 생성 시)                        │
│ - 독립적인 Docker 빌드 검증        │
└─────────────────────────────────────┘
    ↓
main 브랜치 푸시 시
    ↓
┌─────────────────────────────────────┐
│ 배포 워크플로우 실행                │
│ - Node.js 빌드 테스트               │
│ - Docker 빌드 검증                  │
│ - DigitalOcean 배포 트리거          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ DigitalOcean App Platform           │
│ - Docker 이미지 빌드                │
│ - 컨테이너 배포                     │
│ - 헬스 체크 확인                    │
└─────────────────────────────────────┘
```

### GitHub Secrets 설정

배포를 위해 다음 Secrets를 GitHub 저장소에 설정해야 합니다:

#### 필수 Secrets

1. **DIGITALOCEAN_ACCESS_TOKEN**
   - DigitalOcean API 토큰
   - 생성 방법: [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
   - 권한: `Write`

2. **DIGITALOCEAN_APP_ID**
   - DigitalOcean App Platform 앱 ID
   - 확인 방법: DigitalOcean 콘솔 또는 `doctl apps list`

#### 선택적 Secrets

3. **VITE_API_BASE_URL** (선택사항)
   - CI/CD 테스트 시 사용할 API URL
   - 설정하지 않으면 기본값 사용: `http://localhost:4000`

**Secrets 설정 방법:**
1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭
4. 각 Secret 추가

### 워크플로우 실행 확인

#### GitHub Actions에서 확인

1. 저장소의 "Actions" 탭으로 이동
2. 실행 중인 워크플로우 확인
3. 각 단계별 로그 확인
4. 실패 시 로그에서 오류 확인

#### 로컬에서 확인

```bash
# 워크플로우 파일 문법 검증
# GitHub Actions는 자동으로 검증하지만, 로컬에서도 확인 가능
yamllint .github/workflows/*.yml
```

### 배포 상태 모니터링

#### GitHub Actions에서

- Actions 탭에서 실시간 진행 상황 확인
- 각 단계별 성공/실패 상태 확인
- 로그를 통한 상세 정보 확인

#### DigitalOcean에서

```bash
# 배포 상태 확인
doctl apps list-deployments <APP_ID>

# 배포 로그 확인
doctl apps logs <APP_ID> --type build
doctl apps logs <APP_ID> --type run
```

### 수동 배포

GitHub Actions를 사용하지 않고 수동으로 배포하려면:

```bash
# doctl CLI 사용
doctl apps create-deployment <APP_ID> --wait
```

또는 DigitalOcean 콘솔에서:
1. Apps > 앱 선택
2. "Actions" > "Create Deployment" 클릭

## 트러블슈팅

### 배포 실패 시

1. **로그 확인**
   ```bash
   doctl apps logs <APP_ID> --type run
   doctl apps logs <APP_ID> --type build
   ```

2. **환경 변수 확인**
   - DigitalOcean 콘솔에서 모든 환경 변수가 올바르게 설정되었는지 확인
   - 특히 `DATABASE_URL`이 올바른지 확인

3. **빌드 오류**
   - 로컬에서 빌드 테스트:
     ```bash
     npm ci
     npm install prisma@6.1.0 @prisma/client@6.1.0 --save-dev --save-exact
     npx prisma@6.1.0 generate
     npm run build
     npm run build:server
     ```

4. **데이터베이스 마이그레이션 실패**
   - Prisma 마이그레이션 상태 확인:
     ```bash
     doctl apps logs <APP_ID> --type run | grep -i prisma
     ```
   - 필요시 수동으로 마이그레이션 실행

### 일반적인 문제

#### 1. "DATABASE_URL not set" 오류

- DigitalOcean 콘솔에서 데이터베이스가 앱에 연결되어 있는지 확인
- 환경 변수에서 `DATABASE_URL=${db.DATABASE_URL}` 설정 확인

#### 2. "Prisma Client not generated" 오류

- 빌드 명령어에 Prisma 생성 단계가 포함되어 있는지 확인
- `app.yaml`의 `build_command` 확인

#### 3. "Port already in use" 오류

- `app.yaml`에서 `http_port: 4000` 설정 확인
- 환경 변수 `PORT=4000` 확인

#### 4. CORS 오류

- `CORS_ORIGIN` 환경 변수가 `${_self.URL}`로 설정되어 있는지 확인
- `FRONTEND_URL` 환경 변수 확인

#### 5. Docker 빌드 관련 문제

- Dockerfile이 올바르게 인식되는지 확인
- 빌드 로그에서 Docker 빌드 단계 확인:
  ```bash
  doctl apps logs <APP_ID> --type build
  ```
- 로컬에서 Docker 빌드 테스트:
  ```bash
  docker build -t ggfinder-test .
  docker run -p 4000:4000 ggfinder-test
  ```
- GitHub Actions에서 Docker 빌드 실패 시:
  - Actions 탭에서 "Docker Build Test" 또는 "Docker Build Verification" 단계 로그 확인
  - 빌드 타임 환경 변수 설정 확인
  - Dockerfile 문법 확인

#### 6. GitHub Actions 워크플로우 실패

- 워크플로우 파일 문법 오류:
  - Actions 탭에서 빨간색 X 표시 확인
  - 워크플로우 파일 문법 검증 필요
- Secrets 미설정:
  - Settings > Secrets and variables > Actions에서 필수 Secrets 확인
  - `DIGITALOCEAN_ACCESS_TOKEN` 및 `DIGITALOCEAN_APP_ID` 설정 확인
- Docker 빌드 실패:
  - Actions 로그에서 Docker 빌드 단계 확인
  - 로컬에서 동일한 빌드 테스트: `./scripts/test-docker-build.sh`

## 추가 리소스

- [DigitalOcean App Platform 문서](https://docs.digitalocean.com/products/app-platform/)
- [doctl CLI 문서](https://docs.digitalocean.com/reference/doctl/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

## 보안 주의사항

⚠️ **중요**: 다음 정보는 절대 GitHub에 커밋하지 마세요:

- API 토큰
- 비밀 키 (JWT_SECRET 등)
- 데이터베이스 연결 문자열
- OAuth 클라이언트 시크릿

모든 민감한 정보는 GitHub Secrets 또는 DigitalOcean 환경 변수로 관리하세요.
