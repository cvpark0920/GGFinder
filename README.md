# GGFinder

국제결혼 매칭 플랫폼 GGFinder의 웹 애플리케이션입니다.

원본 디자인: https://www.figma.com/design/RtitD5pO9JmuBUys7w2IS6/GGFinder

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Google OAuth 2.0
- **Deployment**: DigitalOcean App Platform

## 로컬 개발 환경 설정

### 필수 요구사항

- Node.js 20 이상
- PostgreSQL 16 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/YOUR_USERNAME/GGFinder.git
   cd GGFinder
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```
   
   `.env` 파일을 열어 필요한 값들을 설정하세요:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
   - `JWT_SECRET`: JWT 토큰 서명용 시크릿 키

4. **데이터베이스 설정**
   ```bash
   # Prisma Client 생성
   npm run prisma:generate
   
   # 데이터베이스 마이그레이션 실행
   npm run migrate:dev
   ```

5. **개발 서버 실행**
   ```bash
   # 프론트엔드 개발 서버 (터미널 1)
   npm run dev
   
   # 백엔드 개발 서버 (터미널 2)
   npm run dev:server
   ```

   - 프론트엔드: http://localhost:4001
   - 백엔드 API: http://localhost:4000

### Docker를 사용한 로컬 실행

**상세 가이드는 [DOCKER_LOCAL_SETUP.md](./DOCKER_LOCAL_SETUP.md)를 참조하세요.**

#### 빠른 시작

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 JWT_SECRET 등 필수 값 설정

# 2. Docker 컨테이너 빌드 및 실행
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f app

# 4. 브라우저에서 확인
# http://localhost:4000 접속
```

#### npm 스크립트 사용

```bash
# Docker Compose로 전체 스택 실행
npm run docker:build
npm run docker:up

# 로그 확인
npm run docker:logs

# 중지
npm run docker:down

# 완전 정리 (데이터 삭제)
npm run docker:clean
```

## 빌드

```bash
# 프론트엔드 빌드
npm run build

# 서버 빌드
npm run build:server
```

## GitHub 저장소 연결

1. **GitHub에서 새 저장소 생성**
   - https://github.com/new 에서 새 저장소 생성

2. **로컬 저장소와 연결**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/GGFinder.git
   git push -u origin main
   ```

## DigitalOcean 배포

### 사전 준비

1. **DigitalOcean 계정 생성**
   - https://www.digitalocean.com 에서 계정 생성

2. **API 토큰 생성**
   - DigitalOcean 대시보드 > API > Tokens/Keys
   - "Generate New Token" 클릭
   - 토큰 이름 입력 및 권한 선택
   - 생성된 토큰 복사 (한 번만 표시됨)

3. **GitHub Secrets 설정**
   - GitHub 저장소 > Settings > Secrets and variables > Actions
   - 다음 Secrets 추가:
     - `DIGITALOCEAN_ACCESS_TOKEN`: DigitalOcean API 토큰
     - `VITE_API_BASE_URL`: 프로덕션 API URL (배포 후 설정)

### 배포 설정

1. **app.yaml 파일 수정**
   - `app.yaml` 파일에서 `YOUR_USERNAME`을 실제 GitHub 사용자명으로 변경

2. **DigitalOcean App Platform에서 앱 생성**
   - DigitalOcean 대시보드 > Apps > Create App
   - GitHub 저장소 연결
   - Branch: `main` 선택
   - Build Command:
     ```bash
     npm ci && npx prisma generate && npm run build && npm run build:server
     ```
   - Run Command:
     ```bash
     npx prisma migrate deploy && node server/dist/index.js
     ```
   - HTTP Port: `4000`
   - Health Check Path: `/health`

3. **환경 변수 설정**
   DigitalOcean App Platform의 Settings > App-Level Environment Variables에서 설정:
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `DATABASE_URL`: (데이터베이스 추가 시 자동 생성)
   - `JWT_SECRET`: (시크릿으로 설정)
   - `GOOGLE_CLIENT_ID`: (시크릿으로 설정)
   - `GOOGLE_CLIENT_SECRET`: (시크릿으로 설정)
   - `CORS_ORIGIN`: (앱 URL)
   - `FRONTEND_URL`: (앱 URL)
   - `VITE_API_BASE_URL`: (앱 URL)

4. **데이터베이스 추가**
   - App Platform에서 Database 추가
   - PostgreSQL 선택
   - 데이터베이스 이름: `ggfinder`
   - 사용자 이름: `app`

### 자동 배포

- `main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하고 DigitalOcean에 배포합니다.
- 배포 상태는 GitHub Actions 탭에서 확인할 수 있습니다.

## 프로젝트 구조

```
GGFinder/
├── src/                    # 프론트엔드 소스 코드
│   ├── components/        # React 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── hooks/             # Custom hooks
│   ├── utils/             # 유틸리티 함수
│   └── locales/           # 다국어 번역 파일
├── server/                 # 백엔드 소스 코드
│   ├── routes/            # API 라우트
│   ├── middleware/         # Express 미들웨어
│   └── index.ts           # 서버 진입점
├── prisma/                # Prisma 스키마 및 마이그레이션
├── .github/               # GitHub Actions 워크플로우
├── Dockerfile             # Docker 이미지 빌드 설정
├── docker-compose.yml     # Docker Compose 설정
└── app.yaml              # DigitalOcean App Platform 설정
```

## 주요 기능

- 사용자 인증 (Google OAuth)
- 프로필 관리 (신랑/신부)
- 찜하기 및 매칭 관리
- 소속사 관리
- 대시보드 및 통계
- 다국어 지원 (한국어, 베트남어, 영어)

## 스크립트

- `npm run dev`: 프론트엔드 개발 서버 시작
- `npm run dev:server`: 백엔드 개발 서버 시작
- `npm run build`: 프론트엔드 빌드
- `npm run build:server`: 백엔드 빌드
- `npm run migrate:dev`: 개발용 데이터베이스 마이그레이션
- `npm run migrate:deploy`: 프로덕션용 데이터베이스 마이그레이션
- `npm run prisma:generate`: Prisma Client 생성

## 라이선스

Private
