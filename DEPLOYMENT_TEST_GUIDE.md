# 배포 테스트 가이드

## ✅ 로컬 테스트 완료

로컬 배포 테스트가 성공적으로 완료되었습니다:
- ✅ Docker 이미지 빌드 성공
- ✅ 필수 파일 확인 완료
- ✅ 워크플로우 구조 검증 완료

## 🚀 실제 배포 진행 방법

### 1. GitHub Secrets 확인

배포를 진행하기 전에 다음 Secrets가 GitHub 저장소에 설정되어 있어야 합니다:

**필수 Secrets:**
- `DROPLET_IP`: DigitalOcean Droplet의 공인 IP 주소
- `SSH_USERNAME`: SSH 접속 사용자명 (일반적으로 `root`)
- `SSH_PRIVATE_KEY`: SSH 개인키 내용 (전체 내용)
- `JWT_SECRET`: JWT 서명용 비밀키

**선택적 Secrets:**
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `POSTGRES_PASSWORD`: 데이터베이스 비밀번호 (기본값 사용 가능)
- `SSH_PORT`: SSH 포트 (기본값: 22)

### 2. Secrets 설정 방법

1. GitHub 저장소로 이동
2. **Settings** > **Secrets and variables** > **Actions** 클릭
3. **New repository secret** 클릭
4. 각 Secret의 이름과 값을 입력
5. **Add secret** 클릭

### 3. 배포 실행 방법

#### 방법 1: GitHub Actions에서 수동 실행 (권장)

1. GitHub 저장소의 **Actions** 탭으로 이동
2. 왼쪽 사이드바에서 **Deploy to DigitalOcean Droplet** 워크플로우 선택
3. **Run workflow** 버튼 클릭
4. 브랜치 선택 (main)
5. **Run workflow** 클릭

#### 방법 2: main 브랜치에 push

```bash
git add .
git commit -m "feat: 배포 워크플로우 개선 및 테스트 스크립트 추가"
git push origin main
```

### 4. 배포 진행 상황 확인

1. **Actions** 탭에서 실행 중인 워크플로우 클릭
2. 각 단계의 로그를 확인:
   - ✅ Validate secrets: Secrets 검증
   - ✅ Deploy to Droplet via SSH: 실제 배포 실행
   - ✅ Verify deployment: 배포 검증
   - ✅ Deployment summary: 배포 요약

### 5. 배포 성공 확인

배포가 성공하면 다음 명령어로 확인할 수 있습니다:

```bash
# 헬스체크
curl http://<DROPLET_IP>:4000/health

# 또는 브라우저에서 접속
http://<DROPLET_IP>:4000
```

### 6. 문제 해결

#### 배포 실패 시

1. **GitHub Actions 로그 확인**
   - Actions 탭에서 실패한 워크플로우 클릭
   - 실패한 단계의 로그 확인

2. **Droplet에 직접 접속하여 확인**
   ```bash
   ssh <SSH_USERNAME>@<DROPLET_IP>
   cd /app/ggfinder
   docker compose logs -f
   ```

3. **롤백 실행**
   ```bash
   ssh <SSH_USERNAME>@<DROPLET_IP>
   cd /app/ggfinder
   ./scripts/rollback-deployment.sh
   ```

#### 일반적인 문제

**문제: SSH 연결 실패**
- 해결: SSH_PRIVATE_KEY가 올바르게 설정되었는지 확인
- 해결: Droplet의 방화벽에서 SSH 포트(22)가 열려있는지 확인

**문제: Git clone 실패**
- 해결: Droplet에 GitHub SSH 키가 설정되어 있는지 확인
- 해결: 저장소가 Private인 경우 Deploy Key 설정 필요

**문제: Docker 빌드 실패**
- 해결: Droplet에 충분한 디스크 공간이 있는지 확인
- 해결: Docker 로그 확인: `docker compose logs`

**문제: 헬스체크 실패**
- 해결: 컨테이너 상태 확인: `docker compose ps`
- 해결: 애플리케이션 로그 확인: `docker compose logs app`
- 해결: 데이터베이스 연결 확인: `docker compose logs db`

## 📋 배포 체크리스트

배포 전 확인:

- [ ] GitHub Secrets 설정 완료
- [ ] Droplet이 실행 중이고 접근 가능
- [ ] SSH 키가 올바르게 설정됨
- [ ] 방화벽에서 4000번 포트 허용됨
- [ ] Docker 및 Docker Compose가 Droplet에 설치됨
- [ ] 로컬 테스트 완료 (`./scripts/test-deployment.sh`)

## 🔄 롤백 방법

배포 후 문제가 발생하면 롤백 스크립트를 사용하세요:

```bash
ssh <SSH_USERNAME>@<DROPLET_IP>
cd /app/ggfinder
./scripts/rollback-deployment.sh
```

스크립트가 백업 목록을 보여주고, 원하는 백업을 선택하여 롤백할 수 있습니다.

## 📊 모니터링

배포 후 다음 명령어로 상태를 모니터링할 수 있습니다:

```bash
# 컨테이너 상태
docker compose ps

# 실시간 로그
docker compose logs -f

# 리소스 사용량
docker stats

# 디스크 사용량
df -h
```

