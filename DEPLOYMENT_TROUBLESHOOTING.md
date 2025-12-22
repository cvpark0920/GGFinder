# 배포 문제 해결 가이드

## 🔍 컨테이너 재시작 문제 진단

### 빠른 상태 확인

Droplet에 SSH 접속 후 다음 명령어로 상태를 확인하세요:

```bash
ssh <SSH_USERNAME>@<DROPLET_IP>
cd /app/ggfinder

# 상태 확인 스크립트 실행
./scripts/check-deployment-status.sh
```

### 수동 확인 방법

#### 1. 컨테이너 상태 확인

```bash
cd /app/ggfinder
docker compose ps
```

**출력 해석:**
- `Up`: 정상 실행 중
- `Restarting`: 재시작 중 (문제 발생)
- `Exited`: 종료됨 (문제 발생)
- `Restarts`: 재시작 횟수 (5회 이상이면 문제)

#### 2. 실시간 로그 확인

```bash
# 앱 컨테이너 로그 (실시간)
docker compose logs -f app

# 최근 100줄만 확인
docker compose logs --tail=100 app

# 에러만 확인
docker compose logs app 2>&1 | grep -i error
```

#### 3. 데이터베이스 로그 확인

```bash
# 데이터베이스 로그
docker compose logs -f db

# 데이터베이스 연결 테스트
docker compose exec db pg_isready -U app
```

#### 4. 리소스 사용량 확인

```bash
# CPU 및 메모리 사용량
docker stats

# 디스크 사용량
df -h
docker system df
```

#### 5. 헬스체크 확인

```bash
# 로컬에서 헬스체크
curl http://localhost:4000/health

# 외부에서 헬스체크
curl http://<DROPLET_IP>:4000/health
```

#### 6. 마이그레이션 상태 확인

```bash
# 마이그레이션 상태
docker compose exec app npx prisma@6.1.0 migrate status

# 마이그레이션 히스토리
docker compose exec app npx prisma@6.1.0 migrate list
```

## 🚨 일반적인 문제 및 해결 방법

### 문제 1: 마이그레이션 실패로 인한 재시작

**증상:**
- 컨테이너가 계속 재시작됨
- 로그에 "failed migrations" 또는 "P3009" 에러

**해결 방법:**

```bash
# 실패한 마이그레이션 해결
docker compose exec app npx prisma@6.1.0 migrate resolve --applied 20251215234033_add_father_mother_age

# 컨테이너 재시작
docker compose restart app
```

### 문제 2: 데이터베이스 연결 실패

**증상:**
- "database connection failed" 에러
- 데이터베이스 컨테이너가 실행되지 않음

**해결 방법:**

```bash
# 데이터베이스 컨테이너 상태 확인
docker compose ps db

# 데이터베이스 컨테이너 재시작
docker compose restart db

# 데이터베이스 로그 확인
docker compose logs db

# 연결 테스트
docker compose exec db psql -U app -d ggfinder -c "SELECT 1;"
```

### 문제 3: 메모리 부족

**증상:**
- "out of memory" 에러
- 컨테이너가 자주 재시작됨

**해결 방법:**

```bash
# 메모리 사용량 확인
docker stats

# 오래된 이미지 및 컨테이너 정리
docker system prune -a

# 불필요한 볼륨 정리
docker volume prune
```

### 문제 4: 포트 충돌

**증상:**
- "port already in use" 에러
- 컨테이너가 시작되지 않음

**해결 방법:**

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep 4000

# 기존 컨테이너 중지
docker compose down

# 다시 시작
docker compose up -d
```

### 문제 5: 환경 변수 누락

**증상:**
- "environment variable not found" 에러
- 애플리케이션이 시작되지 않음

**해결 방법:**

```bash
# .env 파일 확인
cat .env

# 환경 변수 확인
docker compose exec app env | grep -E "JWT_SECRET|DATABASE_URL|GOOGLE_CLIENT"

# .env 파일 재생성 (필요시)
# 배포 스크립트가 자동으로 생성하지만, 수동으로 확인 가능
```

## 🔧 고급 진단

### 컨테이너 내부 접속

```bash
# 앱 컨테이너에 접속
docker compose exec app sh

# 컨테이너 내부에서 확인
ps aux
env
ls -la /app
```

### 데이터베이스 직접 접속

```bash
# PostgreSQL에 접속
docker compose exec db psql -U app -d ggfinder

# 마이그레이션 테이블 확인
SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 10;

# 테이블 목록 확인
\dt

# 특정 테이블 구조 확인
\d clients
```

### 네트워크 문제 진단

```bash
# 컨테이너 간 네트워크 확인
docker compose exec app ping db

# 포트 확인
docker compose port app 4000
docker compose port db 5432
```

## 📊 모니터링 명령어

### 실시간 모니터링

```bash
# 모든 컨테이너 로그 실시간 확인
docker compose logs -f

# 특정 컨테이너만
docker compose logs -f app

# 리소스 사용량 실시간
docker stats
```

### 정기적인 상태 확인

```bash
# 상태 확인 스크립트 실행
./scripts/check-deployment-status.sh

# 또는 cron으로 자동화
# crontab -e
# */5 * * * * cd /app/ggfinder && ./scripts/check-deployment-status.sh >> /var/log/deployment-status.log 2>&1
```

## 🆘 긴급 복구

### 완전 재시작

```bash
cd /app/ggfinder

# 모든 컨테이너 중지
docker compose down

# 볼륨은 유지하고 재시작
docker compose up -d

# 로그 확인
docker compose logs -f
```

### 롤백

```bash
# 롤백 스크립트 실행
./scripts/rollback-deployment.sh

# 또는 수동 롤백
cd /app/ggfinder-backups
ls -lt  # 백업 목록 확인
# 원하는 백업 선택 후 복원
```

## 📞 지원

문제가 해결되지 않으면 다음 정보를 수집하세요:

```bash
# 전체 상태 정보 수집
./scripts/check-deployment-status.sh > deployment-status-$(date +%Y%m%d_%H%M%S).log 2>&1

# 로그 수집
docker compose logs > deployment-logs-$(date +%Y%m%d_%H%M%S).log 2>&1
```

## 🔗 유용한 링크

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Prisma Migrate 문서](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

