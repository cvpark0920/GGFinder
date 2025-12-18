# 로컬 Docker 배포 환경 테스트 가이드

이 문서는 로컬에서 DigitalOcean 배포 환경과 동일한 Docker 빌드 및 실행 환경을 테스트하는 방법을 설명합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [빌드 테스트](#빌드-테스트)
4. [전체 스택 테스트](#전체-스택-테스트)
5. [수동 테스트](#수동-테스트)
6. [트러블슈팅](#트러블슈팅)

## 사전 준비사항

- Docker 및 Docker Compose 설치
  - macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: `sudo apt-get install docker.io docker-compose` 또는 해당 배포판의 패키지 매니저 사용
- 최소 4GB 이상의 여유 메모리
- 포트 4000, 5432가 사용 가능해야 함

## 환경 변수 설정

### 1. .env 파일 생성

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

### 2. .env 파일 편집

`.env` 파일을 열어 필요한 값을 설정합니다:

```bash
# 필수 설정
VITE_API_BASE_URL=http://localhost:4000
JWT_SECRET=your-strong-secret-key-here

# Google OAuth (선택사항 - 로컬 테스트 시 필요 없을 수 있음)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS 설정
CORS_ORIGIN=http://localhost:4000
FRONTEND_URL=http://localhost:4000
```

**JWT_SECRET 생성 방법:**

```bash
# 강력한 랜덤 문자열 생성
openssl rand -hex 32
```

## 빌드 테스트

Docker 이미지가 올바르게 빌드되는지 테스트합니다.

### 자동 테스트 스크립트 사용

```bash
./scripts/test-docker-build.sh
```

이 스크립트는:
- `.env` 파일 확인
- Docker 이미지 빌드
- 빌드 성공 여부 확인

### 수동 빌드 테스트

```bash
# 환경 변수 설정
export VITE_API_BASE_URL=http://localhost:4000

# Docker 이미지 빌드
docker build \
  --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
  -t ggfinder:test \
  -f Dockerfile \
  .

# 빌드 확인
docker images ggfinder:test
```

## 전체 스택 테스트

docker-compose를 사용하여 전체 스택(데이터베이스 + 애플리케이션)을 테스트합니다.

### 자동 테스트 스크립트 사용

```bash
./scripts/test-docker-full.sh
```

이 스크립트는:
- 기존 컨테이너 정리
- Docker 이미지 빌드
- 컨테이너 시작
- 데이터베이스 연결 확인
- 헬스 체크 확인
- 테스트 결과 출력

### 수동 테스트

```bash
# 1. 기존 컨테이너 정리 (선택사항)
docker-compose down -v

# 2. 이미지 빌드 및 컨테이너 시작
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f app

# 4. 헬스 체크 확인
curl http://localhost:4000/health

# 5. 브라우저에서 확인
# http://localhost:4000 접속
```

## 수동 테스트

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 컨테이너 로그 확인
docker-compose logs app
docker-compose logs db

# 실시간 로그 확인
docker-compose logs -f app
```

### 데이터베이스 연결 확인

```bash
# 데이터베이스 컨테이너에 접속
docker-compose exec db psql -U app -d ggfinder

# 데이터베이스 목록 확인
docker-compose exec db psql -U app -c "\l"

# 테이블 목록 확인
docker-compose exec db psql -U app -d ggfinder -c "\dt"
```

### 애플리케이션 테스트

```bash
# 헬스 체크
curl http://localhost:4000/health

# JSON 형식으로 확인 (jq 필요)
curl -s http://localhost:4000/health | jq .

# 브라우저에서 확인
open http://localhost:4000  # macOS
# 또는 브라우저에서 직접 http://localhost:4000 접속
```

### 컨테이너 중지 및 정리

```bash
# 컨테이너 중지 (데이터는 유지)
docker-compose stop

# 컨테이너 중지 및 제거 (데이터는 유지)
docker-compose down

# 컨테이너 및 볼륨 완전 제거 (데이터 삭제)
docker-compose down -v
```

## 트러블슈팅

### 빌드 실패

**문제**: Docker 빌드가 실패합니다.

**해결 방법**:
1. 빌드 로그 확인:
   ```bash
   docker build --build-arg VITE_API_BASE_URL="http://localhost:4000" -t ggfinder:test .
   ```

2. 캐시 없이 빌드:
   ```bash
   docker build --no-cache --build-arg VITE_API_BASE_URL="http://localhost:4000" -t ggfinder:test .
   ```

3. Dockerfile의 각 단계 확인:
   ```bash
   docker build --progress=plain --build-arg VITE_API_BASE_URL="http://localhost:4000" -t ggfinder:test .
   ```

### 데이터베이스 연결 실패

**문제**: 애플리케이션이 데이터베이스에 연결할 수 없습니다.

**해결 방법**:
1. 데이터베이스 컨테이너 상태 확인:
   ```bash
   docker-compose ps db
   docker-compose logs db
   ```

2. 데이터베이스 연결 테스트:
   ```bash
   docker-compose exec db pg_isready -U app
   ```

3. DATABASE_URL 확인:
   ```bash
   docker-compose exec app env | grep DATABASE_URL
   ```

4. 컨테이너 재시작:
   ```bash
   docker-compose restart db
   docker-compose restart app
   ```

### 포트 충돌

**문제**: 포트 4000 또는 5432가 이미 사용 중입니다.

**해결 방법**:
1. 사용 중인 포트 확인:
   ```bash
   # macOS/Linux
   lsof -i :4000
   lsof -i :5432
   ```

2. 다른 포트 사용:
   - `.env` 파일에서 `PORT` 변경
   - `docker-compose.yml`에서 포트 매핑 변경

### 헬스 체크 실패

**문제**: 헬스 체크 엔드포인트가 응답하지 않습니다.

**해결 방법**:
1. 애플리케이션 로그 확인:
   ```bash
   docker-compose logs app
   ```

2. 컨테이너 내부에서 직접 확인:
   ```bash
   docker-compose exec app wget --spider http://localhost:4000/health
   ```

3. Prisma 마이그레이션 확인:
   ```bash
   docker-compose exec app npx prisma@6.1.0 migrate status
   ```

### 환경 변수 문제

**문제**: 환경 변수가 제대로 로드되지 않습니다.

**해결 방법**:
1. `.env` 파일 확인:
   ```bash
   cat .env
   ```

2. 컨테이너 내부 환경 변수 확인:
   ```bash
   docker-compose exec app env
   ```

3. docker-compose.yml에서 환경 변수 확인:
   ```bash
   docker-compose config
   ```

### 이미지 크기 문제

**문제**: Docker 이미지가 너무 큽니다.

**해결 방법**:
1. 멀티 스테이지 빌드 확인 (이미 적용됨)
2. 불필요한 파일 제거:
   - `.dockerignore` 파일 확인
   - `node_modules` 제외 확인

3. 이미지 크기 확인:
   ```bash
   docker images ggfinder
   ```

## 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [DigitalOcean 배포 가이드](./DEPLOYMENT.md)

## 빠른 참조

### 자주 사용하는 명령어

```bash
# 전체 테스트 실행
./scripts/test-docker-full.sh

# 빌드만 테스트
./scripts/test-docker-build.sh

# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 컨테이너 중지
docker-compose down

# 완전 정리
docker-compose down -v
```

### 환경 변수 체크리스트

- [ ] `VITE_API_BASE_URL` 설정됨
- [ ] `JWT_SECRET` 설정됨 (강력한 값)
- [ ] `GOOGLE_CLIENT_ID` 설정됨 (필요시)
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨 (필요시)
- [ ] `CORS_ORIGIN` 설정됨
- [ ] `FRONTEND_URL` 설정됨

