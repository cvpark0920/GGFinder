# .env 파일 자동 작업 가이드

## 📋 개요

`.env` 파일이 이제 GitHub에 포함되어 있으며, 배포 시 자동으로 환경 변수가 교체됩니다.

## 🔧 작동 방식

### 1. GitHub에 포함된 .env 파일

`.env` 파일은 GitHub에 포함되어 있지만, 민감한 정보는 플레이스홀더로 대체되어 있습니다:

```env
JWT_SECRET=${JWT_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### 2. 자동 환경 변수 교체

GitHub Actions 배포 시:
1. GitHub에 포함된 `.env` 파일 확인
2. GitHub Secrets에서 실제 값 가져오기
3. 플레이스홀더(`${VAR}`)를 실제 값으로 교체
4. 파일 권한 설정 (`chmod 600`)

### 3. 환경 변수 우선순위

1. **GitHub Secrets** (최우선)
2. 기본값 (플레이스홀더에 `:-default` 형식 사용)
3. `.env` 파일의 기본값

## 🚀 사용 방법

### 환경 변수 추가/수정

1. **로컬에서 `.env` 파일 수정**:
   ```bash
   nano .env
   # 새로운 환경 변수 추가 또는 기존 변수 수정
   ```

2. **GitHub에 푸시**:
   ```bash
   git add .env
   git commit -m "feat: 환경 변수 추가"
   git push origin main
   ```

3. **GitHub Secrets 설정** (민감한 정보의 경우):
   - `Settings` → `Secrets and variables` → `Actions`
   - 새 Secret 추가

4. **자동 배포**:
   - `main` 브랜치에 푸시하면 자동으로 배포 시작
   - GitHub Actions가 `.env` 파일의 플레이스홀더를 실제 값으로 교체

### 환경 변수 형식

#### 기본 형식 (필수 값)
```env
JWT_SECRET=${JWT_SECRET}
```
- GitHub Secrets에 반드시 설정되어 있어야 함
- 없으면 빈 값으로 교체됨

#### 기본값 포함 형식 (선택적 값)
```env
VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://finder.ggacademy.top}
```
- GitHub Secrets에 있으면 그 값 사용
- 없으면 기본값(`https://finder.ggacademy.top`) 사용

## 📝 예시

### .env 파일 (GitHub에 포함)
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=${JWT_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://finder.ggacademy.top}
```

### GitHub Secrets 설정
- `JWT_SECRET`: `your-actual-jwt-secret`
- `GOOGLE_CLIENT_ID`: `your-google-client-id`
- `VITE_API_BASE_URL`: (선택사항, 없으면 기본값 사용)

### 배포 후 .env 파일 (Droplet에서)
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=your-actual-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE_URL=https://finder.ggacademy.top
```

## ⚠️ 보안 주의사항

### ✅ 안전한 방법

1. **민감한 정보는 GitHub Secrets 사용**:
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_SECRET`
   - `POSTGRES_PASSWORD`

2. **플레이스홀더 사용**:
   ```env
   JWT_SECRET=${JWT_SECRET}
   ```

3. **기본값 사용** (비민감한 정보):
   ```env
   PORT=4000
   NODE_ENV=production
   ```

### ❌ 위험한 방법

1. **실제 비밀번호를 GitHub에 푸시**:
   ```env
   JWT_SECRET=actual-secret-value  # ❌ 절대 하지 마세요!
   ```

2. **민감한 정보를 기본값으로 설정**:
   ```env
   POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-real-password}  # ❌ 위험!
   ```

## 🔍 문제 해결

### 환경 변수가 교체되지 않는 경우

1. **GitHub Secrets 확인**:
   ```bash
   # GitHub → Settings → Secrets and variables → Actions
   ```

2. **배포 로그 확인**:
   ```bash
   # GitHub Actions 로그에서 확인
   # "📋 GitHub에 포함된 .env 파일 발견, 환경 변수 교체 중..." 메시지 확인
   ```

3. **Droplet에서 확인**:
   ```bash
   ssh root@<DROPLET_IP>
   cd /app/ggfinder
   cat .env
   # 플레이스홀더가 실제 값으로 교체되었는지 확인
   ```

### 환경 변수 추가 시

1. **로컬에서 `.env` 파일 수정**:
   ```bash
   nano .env
   # 새 환경 변수 추가
   NEW_VAR=${NEW_VAR:-default-value}
   ```

2. **GitHub Secrets에 추가** (민감한 정보인 경우):
   - `Settings` → `Secrets and variables` → `Actions`
   - 새 Secret 추가

3. **커밋 및 푸시**:
   ```bash
   git add .env
   git commit -m "feat: 새 환경 변수 추가"
   git push origin main
   ```

4. **자동 배포 확인**:
   - GitHub Actions에서 배포 진행 상황 확인
   - 배포 완료 후 Droplet에서 `.env` 파일 확인

## 💡 팁

### 환경 변수 그룹화

`.env` 파일을 섹션으로 나누어 관리:

```env
# ============================================
# 서버 설정
# ============================================
NODE_ENV=production
PORT=4000

# ============================================
# 인증 설정 (GitHub Secrets에서 주입)
# ============================================
JWT_SECRET=${JWT_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# ============================================
# 데이터베이스 설정 (GitHub Secrets에서 주입)
# ============================================
POSTGRES_USER=app
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### 로컬 개발 환경

로컬에서는 `.env` 파일을 직접 수정하여 사용:

```bash
# .env 파일 수정
nano .env
# 플레이스홀더를 실제 값으로 교체
JWT_SECRET=local-dev-secret
GOOGLE_CLIENT_ID=local-google-client-id
```

## 📚 관련 파일

- `.env`: 환경 변수 파일 (GitHub에 포함)
- `.github/workflows/deploy.yml`: 배포 워크플로우 (자동 교체 로직 포함)
- `ENV_AUTO_GENERATION.md`: 이전 자동 생성 가이드

