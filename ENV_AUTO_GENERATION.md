# .env 파일 자동 생성 가이드

## 📋 개요

`.env` 파일은 보안상 GitHub에 푸시하지 않지만, `.env.example` 템플릿 파일을 기반으로 자동으로 생성됩니다.

## 🔧 작동 방식

### 1. `.env.example` 파일 (템플릿)

GitHub에 포함된 템플릿 파일로, 필요한 환경 변수의 구조를 정의합니다.

```bash
# .env.example 파일 확인
cat .env.example
```

### 2. 자동 생성

GitHub Actions 배포 시:
1. `.env.example` 파일을 확인
2. GitHub Secrets에서 실제 값 가져오기
3. `.env` 파일 자동 생성
4. 파일 권한 설정 (`chmod 600`)

### 3. 수동 생성 (로컬 개발용)

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# 실제 값으로 수정
nano .env
```

## 🚀 사용 방법

### GitHub Actions (자동)

배포 시 자동으로 `.env` 파일이 생성됩니다:

1. GitHub Secrets 설정 확인:
   - `Settings` → `Secrets and variables` → `Actions`
   - 필요한 Secrets가 모두 설정되어 있는지 확인

2. 배포 트리거:
   ```bash
   git push origin main
   ```
   또는 GitHub Actions에서 수동 실행

3. 배포 완료 후:
   - Droplet의 `/app/ggfinder/.env` 파일이 자동 생성됨
   - GitHub Secrets 값으로 채워짐

### 로컬 개발 (수동)

```bash
# 1. .env.example 복사
cp .env.example .env

# 2. 실제 값으로 수정
nano .env

# 3. 파일 권한 설정 (선택사항)
chmod 600 .env
```

### Droplet에서 직접 생성

```bash
cd /app/ggfinder

# 스크립트 사용 (향후 추가 예정)
# ./scripts/generate-env.sh

# 또는 수동으로
cp .env.example .env
nano .env
```

## 📝 환경 변수 목록

### 필수 환경 변수

- `JWT_SECRET`: JWT 토큰 서명용 시크릿
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `POSTGRES_PASSWORD`: 데이터베이스 비밀번호

### 빌드 타임 환경 변수 (재빌드 필요)

- `VITE_API_BASE_URL`: 프론트엔드 API 기본 URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID (빌드 타임)

### 런타임 환경 변수

- `CORS_ORIGIN`: CORS 허용 오리진
- `FRONTEND_URL`: 프론트엔드 URL

## ⚠️ 보안 주의사항

1. **`.env` 파일은 절대 GitHub에 푸시하지 마세요**
   - `.gitignore`에 포함되어 있음
   - 민감한 정보가 포함되어 있음

2. **GitHub Secrets 사용**
   - 프로덕션 환경 변수는 GitHub Secrets에서 관리
   - 배포 시 자동으로 주입됨

3. **파일 권한**
   - `.env` 파일 권한: `600` (소유자만 읽기/쓰기)
   - 자동으로 설정됨

## 🔍 문제 해결

### .env 파일이 생성되지 않는 경우

1. GitHub Secrets 확인:
   ```bash
   # GitHub → Settings → Secrets and variables → Actions
   ```

2. 배포 로그 확인:
   ```bash
   # GitHub Actions 로그에서 확인
   # "📝 Creating .env file..." 메시지 확인
   ```

3. Droplet에서 확인:
   ```bash
   ssh root@<DROPLET_IP>
   cd /app/ggfinder
   ls -la .env
   cat .env
   ```

### 환경 변수가 올바르게 설정되지 않는 경우

1. GitHub Secrets 값 확인
2. 배포 워크플로우 로그 확인
3. `.env` 파일 내용 확인:
   ```bash
   cat .env | grep -v "^#" | grep -v "^$"
   ```

## 📚 관련 파일

- `.env.example`: 환경 변수 템플릿
- `.github/workflows/deploy.yml`: 배포 워크플로우 (자동 생성 로직 포함)
- `scripts/generate-env.sh`: 수동 생성 스크립트 (향후 사용)

## 💡 팁

### 환경 변수 추가 시

1. `.env.example` 파일에 추가:
   ```bash
   nano .env.example
   # 새 환경 변수 추가
   ```

2. GitHub Secrets에 추가 (프로덕션용):
   - `Settings` → `Secrets and variables` → `Actions`
   - 새 Secret 추가

3. 배포 워크플로우 업데이트 (필요한 경우):
   - `.github/workflows/deploy.yml` 수정
   - 새 환경 변수 추가

4. 커밋 및 푸시:
   ```bash
   git add .env.example
   git commit -m "feat: 새 환경 변수 추가"
   git push origin main
   ```

### 로컬 개발 환경

로컬에서는 `.env.example`을 복사하여 `.env` 파일을 만들고 실제 값으로 채우세요:

```bash
cp .env.example .env
nano .env
```

