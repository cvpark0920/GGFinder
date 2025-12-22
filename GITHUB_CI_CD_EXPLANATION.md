# GitHub CI/CD 자동 재빌드 동작 방식

## ❌ 자동 재빌드되지 않는 이유

### 1. `.env` 파일은 GitHub에 푸시되지 않음

`.gitignore` 파일에 `.env`가 포함되어 있어서:
- 로컬에서 `.env` 파일을 수정해도 GitHub에 푸시되지 않습니다
- GitHub Actions는 `.env` 파일을 직접 읽지 않습니다
- 보안상 민감한 정보는 GitHub에 저장하지 않습니다

### 2. GitHub Actions 트리거 조건

현재 워크플로우는 다음 경우에만 실행됩니다:

```yaml
on:
  push:
    branches: [ main ]  # main 브랜치에 푸시될 때
  workflow_dispatch:     # 수동 실행
```

따라서:
- ✅ `main` 브랜치에 코드를 푸시하면 자동 실행
- ✅ GitHub Actions에서 수동으로 실행 가능
- ❌ Droplet에서 `.env` 파일만 수정하면 자동 실행 안 됨

## ✅ GitHub Actions가 환경 변수를 사용하는 방법

GitHub Actions는 **GitHub Secrets**에서 환경 변수를 읽어서 Droplet에 `.env` 파일을 생성합니다:

```yaml
# 7. 운영 환경용 .env 파일 생성 (보안 강화)
cat <<EOF > .env
GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
VITE_GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL || 'https://finder.ggacademy.top' }}
...
EOF
```

## 🔧 환경 변수 변경 후 재배포 방법

### 방법 1: GitHub Secrets 설정 후 재배포 (권장)

1. **GitHub Secrets 설정**:
   - `Settings` → `Secrets and variables` → `Actions`
   - 다음 Secrets 확인/추가:
     - `GOOGLE_CLIENT_ID`: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`
     - `VITE_API_BASE_URL`: `https://finder.ggacademy.top` (선택사항)
     - `FRONTEND_URL`: `https://finder.ggacademy.top` (선택사항)

2. **재배포 트리거**:
   - 방법 A: 코드 푸시
     ```bash
     git commit --allow-empty -m "trigger: 재배포 트리거"
     git push origin main
     ```
   - 방법 B: 수동 실행
     - GitHub → `Actions` 탭
     - `Deploy to DigitalOcean Droplet` 워크플로우 선택
     - `Run workflow` 버튼 클릭

### 방법 2: Droplet에서 직접 수정 (즉시 적용)

```bash
# Droplet에 SSH 접속
ssh root@<DROPLET_IP>

cd /app/ggfinder

# .env 파일 수정
nano .env
# 중복 제거 및 VITE_GOOGLE_CLIENT_ID 추가

# 수동 재빌드
docker compose down
docker compose build --no-cache
docker compose up -d
```

**주의**: 이 방법은 GitHub Actions와 동기화되지 않습니다. 다음 배포 시 GitHub Secrets 값으로 덮어씌워질 수 있습니다.

## 📋 현재 상황 정리

### 현재 `.env` 파일 문제:
- ❌ 중복된 환경 변수 (HTTP 버전이 마지막에 정의됨)
- ❌ `VITE_GOOGLE_CLIENT_ID` 누락

### 해결 방법:

**옵션 1: GitHub Secrets 설정 후 재배포 (권장)**
- 장점: 자동화, 일관성 유지
- 단점: GitHub Secrets 설정 필요

**옵션 2: Droplet에서 직접 수정**
- 장점: 즉시 적용 가능
- 단점: 수동 작업, 다음 배포 시 덮어씌워질 수 있음

## 🎯 권장 작업 순서

1. **GitHub Secrets 확인/설정**:
   ```
   GOOGLE_CLIENT_ID: 407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
   FRONTEND_URL: https://finder.ggacademy.top (선택사항)
   ```

2. **재배포 트리거**:
   ```bash
   git commit --allow-empty -m "trigger: 환경 변수 업데이트를 위한 재배포"
   git push origin main
   ```

3. **배포 확인**:
   - GitHub Actions에서 배포 진행 상황 확인
   - 배포 완료 후 브라우저에서 테스트

## 💡 팁

### GitHub Secrets에 없는 경우

GitHub Secrets에 `VITE_API_BASE_URL`이나 `FRONTEND_URL`이 없어도:
- 워크플로우에서 기본값 `https://finder.ggacademy.top`을 사용합니다
- 하지만 `GOOGLE_CLIENT_ID`는 반드시 설정되어 있어야 합니다

### 환경 변수 우선순위

1. GitHub Secrets (배포 시)
2. Droplet의 `.env` 파일 (로컬 수정 시)
3. 기본값 (워크플로우에 정의된 값)

**중요**: 빌드 타임 환경 변수(`VITE_*`)는 빌드 시점에 결정되므로, 환경 변수 변경 후 반드시 재빌드가 필요합니다.

