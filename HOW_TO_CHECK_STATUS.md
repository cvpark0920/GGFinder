# 배포 상태 확인 방법 가이드

## 🤖 AI가 직접 확인할 수 있는 방법

### 1. GitHub Actions API (인증 필요)
- GitHub CLI 또는 API를 통해 워크플로우 실행 상태 확인 가능
- 하지만 인증 토큰이 필요하여 직접 확인은 제한적

### 2. 공개된 헬스체크 엔드포인트
- 만약 Droplet IP가 공개되어 있다면 헬스체크 엔드포인트 확인 가능
- 하지만 보안상 IP는 일반적으로 공개하지 않음

### 3. 로컬 스크립트 실행
- 로컬에서 실행 가능한 스크립트를 통해 상태 확인 가능
- GitHub CLI를 사용하여 Actions 상태 확인

## ✅ 실제로 상태를 확인하는 방법

### 방법 1: GitHub CLI 사용 (가장 편리)

```bash
# 1. GitHub CLI 설치 (아직 설치하지 않은 경우)
brew install gh  # macOS
# 또는 https://cli.github.com/

# 2. GitHub 로그인
gh auth login

# 3. 상태 확인 스크립트 실행
./scripts/check-github-actions.sh
```

### 방법 2: GitHub 웹 인터페이스

브라우저에서 직접 확인:
```
https://github.com/cvpark0920/GGFinder/actions
```

### 방법 3: Droplet에 직접 접속

```bash
# SSH 접속
ssh <SSH_USERNAME>@<DROPLET_IP>

# 상태 확인 스크립트 실행
cd /app/ggfinder
./scripts/check-deployment-status.sh
```

### 방법 4: GitHub Actions API 직접 호출

```bash
# GitHub Personal Access Token 필요
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/cvpark0920/GGFinder/actions/runs?per_page=5
```

## 🔧 제공된 스크립트

### 1. `scripts/check-github-actions.sh`
로컬에서 GitHub Actions 상태 확인

**사용법:**
```bash
./scripts/check-github-actions.sh
```

**기능:**
- 최근 배포 워크플로우 실행 상태 확인
- 실행 결과 및 로그 링크 제공
- 실시간 로그 확인 명령어 제공

### 2. `scripts/check-deployment-status.sh`
Droplet에서 배포 상태 확인

**사용법:**
```bash
ssh <SSH_USERNAME>@<DROPLET_IP>
cd /app/ggfinder
./scripts/check-deployment-status.sh
```

**기능:**
- 컨테이너 상태 및 재시작 횟수
- 최근 로그 및 에러
- 데이터베이스 연결 상태
- 헬스체크 상태
- 리소스 사용량
- 마이그레이션 상태

## 📊 빠른 상태 확인 명령어

### GitHub Actions 상태
```bash
# GitHub CLI 사용
gh run list --workflow="Deploy to DigitalOcean Droplet" --repo cvpark0920/GGFinder --limit 5

# 최신 실행 로그
gh run view --repo cvpark0920/GGFinder --log
```

### Droplet 상태 (SSH 접속 후)
```bash
# 컨테이너 상태
docker compose ps

# 실시간 로그
docker compose logs -f app

# 재시작 횟수
docker compose ps --format "table {{.Name}}\t{{.Restarts}}"
```

## 🔍 AI가 도울 수 있는 것

제가 직접 할 수 있는 것:
1. ✅ 스크립트 작성 및 제공
2. ✅ 코드 분석 및 문제 진단
3. ✅ 로그 분석 (제공된 경우)
4. ✅ 해결 방법 제안

제가 직접 할 수 없는 것:
1. ❌ Droplet에 직접 SSH 접속
2. ❌ GitHub 인증 토큰 없이 API 호출
3. ❌ 실시간 모니터링
4. ❌ Docker 명령어 직접 실행

## 💡 권장 워크플로우

1. **로컬에서 GitHub Actions 상태 확인**
   ```bash
   ./scripts/check-github-actions.sh
   ```

2. **문제가 있으면 Droplet에 접속하여 상세 확인**
   ```bash
   ssh <SSH_USERNAME>@<DROPLET_IP>
   cd /app/ggfinder
   ./scripts/check-deployment-status.sh
   ```

3. **로그를 복사하여 AI에게 분석 요청**
   - 로그 내용을 공유하면 문제 진단 및 해결 방법 제안 가능

## 🚀 자동화 옵션

### Cron으로 정기적 상태 확인

```bash
# Droplet에 cron 작업 추가
crontab -e

# 5분마다 상태 확인하고 문제가 있으면 알림
*/5 * * * * cd /app/ggfinder && ./scripts/check-deployment-status.sh >> /var/log/deployment-status.log 2>&1
```

### GitHub Actions에 상태 확인 워크플로우 추가

주기적으로 헬스체크를 수행하는 워크플로우를 추가할 수 있습니다.

