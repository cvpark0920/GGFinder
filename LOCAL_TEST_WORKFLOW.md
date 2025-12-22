# 로컬 테스트 및 배포 워크플로우 가이드

이 가이드는 로컬 Docker 환경에서 테스트한 후 배포하는 전체 프로세스를 설명합니다.

## 🚀 빠른 시작

### 1단계: 로컬 개발 환경 설정

```bash
# 로컬 환경 파일 생성 (처음 한 번만)
npm run setup:env:local

# 로컬 Docker 환경 시작
npm run docker:dev
```

### 2단계: 로컬 테스트

```bash
# 로컬 테스트 실행 (헬스체크, API 테스트 등)
npm run test:local

# 또는 브라우저에서 직접 확인
# http://localhost:4000
```

### 3단계: 배포 전 체크

```bash
# 배포 전 체크리스트 실행
npm run deploy:check
```

### 4단계: 배포

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "feat: 변경사항 설명"
git push origin main
```

## 📋 상세 가이드

### 환경 파일 구조

- **`.env.local`**: 로컬 개발 환경 설정 (Git에 포함되지 않음)
- **`.env.production`**: 프로덕션 환경 설정 참고용 (Git에 포함되지 않음)
- **`docker-compose.yml`**: 기본 Docker Compose 설정
- **`docker-compose.dev.yml`**: 로컬 개발용 오버라이드 설정

### 주요 npm 스크립트

#### 환경 설정
- `npm run setup:env:local` - 로컬 개발 환경 파일 생성
- `npm run setup:env:production` - 프로덕션 환경 파일 생성 (참고용)

#### 로컬 개발
- `npm run docker:dev` - 로컬 개발 환경 시작 (자동으로 .env.local 사용)
- `npm run docker:dev:down` - 로컬 개발 환경 중지
- `npm run docker:dev:logs` - 로컬 개발 환경 로그 확인
- `npm run docker:dev:restart` - 로컬 개발 환경 재시작
- `npm run docker:dev:clean` - 로컬 개발 환경 완전 정리 (데이터 삭제)

#### 테스트
- `npm run test:local` - 로컬 환경 테스트 스크립트 실행

#### 배포
- `npm run deploy:check` - 배포 전 체크리스트 실행

#### 프로덕션 (기존)
- `npm run docker:build` - 프로덕션 빌드
- `npm run docker:up` - 프로덕션 실행
- `npm run docker:down` - 프로덕션 중지

## 🔄 일반적인 워크플로우

### 개발 중

```bash
# 1. 로컬 개발 환경 시작
npm run docker:dev

# 2. 코드 수정

# 3. 로컬에서 테스트
npm run test:local

# 4. 브라우저에서 확인
# http://localhost:4000
```

### 배포 전

```bash
# 1. 배포 전 체크리스트 실행
npm run deploy:check

# 2. 모든 체크 통과 확인

# 3. 변경사항 커밋
git add .
git commit -m "feat: 변경사항 설명"

# 4. 배포 (main 브랜치에 푸시)
git push origin main
```

## 🐛 문제 해결

### 로컬 환경이 시작되지 않을 때

```bash
# 환경 파일 확인
cat .env.local

# 환경 파일 재생성
npm run setup:env:local

# Docker 컨테이너 완전 정리 후 재시작
npm run docker:dev:clean
npm run docker:dev
```

### CORS 오류가 발생할 때

`.env.local` 파일에서 다음 설정 확인:
```bash
CORS_ORIGIN=http://localhost:4000
VITE_API_BASE_URL=http://localhost:4000
```

### 빌드 오류가 발생할 때

```bash
# TypeScript 컴파일 확인
npm run build:server

# Docker 빌드 캐시 정리
docker builder prune -af
npm run docker:dev
```

## 📝 주의사항

1. **환경 파일 관리**
   - `.env.local`은 로컬 개발용입니다
   - `.env.production`은 참고용이며, 실제 프로덕션은 GitHub Secrets에서 관리됩니다
   - 환경 파일은 Git에 포함되지 않습니다

2. **로컬 vs 프로덕션**
   - 로컬: `http://localhost:4000` 사용
   - 프로덕션: `https://finder.ggacademy.top` 사용
   - 빌드 시점에 환경 변수가 코드에 포함되므로, 로컬과 프로덕션은 별도로 빌드해야 합니다

3. **데이터베이스**
   - 로컬: Docker 내부 PostgreSQL 사용
   - 프로덕션: 프로덕션 데이터베이스 사용

## 🎯 체크리스트

배포 전에 다음을 확인하세요:

- [ ] 로컬 테스트 통과 (`npm run test:local`)
- [ ] TypeScript 컴파일 성공 (`npm run build:server`)
- [ ] Git 상태 정리 (커밋되지 않은 변경사항 없음)
- [ ] 배포 전 체크리스트 통과 (`npm run deploy:check`)
- [ ] 브라우저에서 로컬 테스트 완료

