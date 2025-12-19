# 로컬 Docker 환경 테스트 가이드

이 가이드는 로컬에서 Docker를 사용하여 GGFinder 애플리케이션을 테스트하는 방법을 설명합니다.

## 📋 사전 준비사항

- **Docker Desktop** 설치 (macOS/Windows)
  - [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (Docker Desktop에 포함됨)
- 최소 **4GB 이상의 여유 메모리**
- 포트 **4000**, **5432**가 사용 가능해야 함

## 🚀 빠른 시작

### 1단계: 환경 변수 설정

```bash
# .env.example 파일을 복사하여 .env 파일 생성
cp .env.example .env
```

### 2단계: .env 파일 편집

`.env` 파일을 열어 최소한 다음 값들을 설정하세요:

```bash
# 필수 설정
VITE_API_BASE_URL=http://localhost:4000
JWT_SECRET=$(openssl rand -hex 32)  # 또는 직접 값 입력

# Google OAuth (선택사항 - 로컬 테스트 시 없어도 됨)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# 로컬 테스트를 위해 환경 변수 검증 건너뛰기
BUILD_VALIDATE_ENV=false
```

**JWT_SECRET 생성:**
```bash
openssl rand -hex 32
```

### 3단계: Docker 컨테이너 빌드 및 실행

```bash
# 이미지 빌드 및 컨테이너 시작
docker-compose up -d --build

# 또는 npm 스크립트 사용
npm run docker:build
npm run docker:up
```

### 4단계: 애플리케이션 확인

브라우저에서 다음 URL로 접속:
- **애플리케이션**: http://localhost:4000
- **헬스 체크**: http://localhost:4000/health

## 📝 상세 가이드

### 환경 변수 설명

| 변수명 | 설명 | 필수 | 기본값 |
|--------|------|------|--------|
| `VITE_API_BASE_URL` | 프론트엔드가 사용할 API URL | ✅ | `http://localhost:4000` |
| `JWT_SECRET` | JWT 토큰 서명용 시크릿 키 | ✅ | 없음 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | ❌ | 없음 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 | ❌ | 없음 |
| `VITE_GOOGLE_CLIENT_ID` | 프론트엔드 빌드용 Google 클라이언트 ID | ❌ | `GOOGLE_CLIENT_ID` |
| `BUILD_VALIDATE_ENV` | 환경 변수 검증 여부 | ❌ | `false` (로컬) |
| `CORS_ORIGIN` | CORS 허용 오리진 | ❌ | `http://localhost:4000` |
| `FRONTEND_URL` | 프론트엔드 URL | ❌ | `http://localhost:4000` |

### Docker Compose 서비스

#### 데이터베이스 (db)
- **이미지**: `postgres:16-alpine`
- **포트**: `5432`
- **볼륨**: `postgres_data` (데이터 영구 저장)
- **환경 변수**: 자동 설정됨

#### 애플리케이션 (app)
- **포트**: `4000`
- **의존성**: 데이터베이스가 준비될 때까지 대기
- **헬스 체크**: `/health` 엔드포인트

### 유용한 명령어

#### 컨테이너 관리

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose stop

# 컨테이너 중지 및 제거 (데이터는 유지)
docker-compose down

# 컨테이너 및 볼륨 완전 제거 (데이터 삭제)
docker-compose down -v

# 컨테이너 재시작
docker-compose restart

# 이미지 재빌드 (캐시 없이)
docker-compose build --no-cache
```

#### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 애플리케이션 로그만
docker-compose logs -f app

# 데이터베이스 로그만
docker-compose logs -f db

# 최근 100줄만
docker-compose logs --tail=100 app
```

#### 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 컨테이너 상태 상세 확인
docker-compose ps -a

# 리소스 사용량 확인
docker stats
```

#### 데이터베이스 접속

```bash
# PostgreSQL CLI 접속
docker-compose exec db psql -U app -d ggfinder

# 데이터베이스 목록 확인
docker-compose exec db psql -U app -c "\l"

# 테이블 목록 확인
docker-compose exec db psql -U app -d ggfinder -c "\dt"

# 마이그레이션 상태 확인
docker-compose exec app npx prisma@6.1.0 migrate status
```

#### 애플리케이션 테스트

```bash
# 헬스 체크
curl http://localhost:4000/health

# API 엔드포인트 테스트
curl http://localhost:4000/api/health

# 컨테이너 내부에서 직접 확인
docker-compose exec app wget --spider http://localhost:4000/health
```

## 🔧 트러블슈팅

### 포트 충돌

**문제**: 포트 4000 또는 5432가 이미 사용 중입니다.

**해결 방법**:
```bash
# 사용 중인 포트 확인 (macOS/Linux)
lsof -i :4000
lsof -i :5432

# .env 파일에서 다른 포트 사용
PORT=4001
POSTGRES_PORT=5433
```

### 빌드 실패

**문제**: Docker 이미지 빌드가 실패합니다.

**해결 방법**:
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 빌드 로그 자세히 확인
docker-compose build --progress=plain
```

### 데이터베이스 연결 실패

**문제**: 애플리케이션이 데이터베이스에 연결할 수 없습니다.

**해결 방법**:
```bash
# 데이터베이스 컨테이너 상태 확인
docker-compose ps db
docker-compose logs db

# 데이터베이스 연결 테스트
docker-compose exec db pg_isready -U app

# 컨테이너 재시작
docker-compose restart db
docker-compose restart app
```

### 환경 변수 문제

**문제**: 환경 변수가 제대로 로드되지 않습니다.

**해결 방법**:
```bash
# .env 파일 확인
cat .env

# 컨테이너 내부 환경 변수 확인
docker-compose exec app env | grep -E "VITE_|JWT_|GOOGLE_"

# docker-compose 설정 확인
docker-compose config
```

### 헬스 체크 실패

**문제**: 헬스 체크 엔드포인트가 응답하지 않습니다.

**해결 방법**:
```bash
# 애플리케이션 로그 확인
docker-compose logs app

# Prisma 마이그레이션 확인
docker-compose exec app npx prisma@6.1.0 migrate status

# 마이그레이션 수동 실행
docker-compose exec app npx prisma@6.1.0 migrate deploy
```

### 이미지 크기 문제

**문제**: Docker 이미지가 너무 큽니다.

**해결 방법**:
- 멀티 스테이지 빌드가 이미 적용되어 있음
- 불필요한 파일이 포함되지 않도록 `.dockerignore` 확인

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [프로덕션 배포 가이드](./DEPLOYMENT.md)
- [Docker 테스트 가이드](./DOCKER_TEST.md)

## ✅ 체크리스트

로컬 Docker 환경 테스트 전 확인사항:

- [ ] Docker Desktop 설치 및 실행 중
- [ ] `.env` 파일 생성 및 필수 변수 설정
- [ ] 포트 4000, 5432 사용 가능
- [ ] 최소 4GB 메모리 여유
- [ ] `docker-compose up -d --build` 실행 성공
- [ ] http://localhost:4000 접속 가능
- [ ] 헬스 체크 엔드포인트 응답 확인

## 🎯 빠른 참조

```bash
# 전체 스택 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f app

# 상태 확인
docker-compose ps

# 중지 및 정리
docker-compose down

# 완전 정리 (데이터 삭제)
docker-compose down -v
```

