# 데이터베이스 인증 실패 문제 해결 가이드

## 문제 상황

```
Authentication failed against database server at `db`, 
the provided database credentials for `app` are not valid.
```

## 원인

데이터베이스 비밀번호가 일치하지 않습니다:
- `.env` 파일의 `POSTGRES_PASSWORD`
- `docker-compose.yml`의 기본값
- 실제 데이터베이스 컨테이너의 비밀번호

이 중 하나가 다른 값으로 설정되어 있습니다.

## 해결 방법

### 방법 1: 자동 수정 스크립트 사용 (권장)

```bash
cd /app/ggfinder
git pull
./scripts/fix-db-credentials.sh
```

### 방법 2: 수동 수정

#### 1단계: .env 파일 확인

```bash
cat .env | grep -E "POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB|DATABASE_URL"
```

#### 2단계: docker-compose.yml 기본값 확인

```bash
grep "POSTGRES_PASSWORD" docker-compose.yml
```

#### 3단계: .env 파일 수정

`.env` 파일에서 `POSTGRES_PASSWORD`와 `DATABASE_URL`을 확인하고 일치시킵니다:

```bash
# .env 파일 수정
nano .env
```

다음과 같이 설정:

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=ggfinder_secure_pass  # docker-compose.yml과 일치해야 함
POSTGRES_DB=ggfinder
DATABASE_URL=postgresql://app:ggfinder_secure_pass@db:5432/ggfinder?schema=public&sslmode=disable
```

**중요**: `POSTGRES_PASSWORD`가 `docker-compose.yml`의 기본값과 일치해야 합니다.

#### 4단계: 컨테이너 재시작

```bash
# 데이터베이스 컨테이너 재시작
docker compose restart db

# 잠시 대기
sleep 5

# 앱 컨테이너 재시작
docker compose restart app

# 로그 확인
docker compose logs app --tail=50 | grep -i error
```

### 방법 3: 데이터베이스 볼륨 재생성 (최후의 수단)

**주의**: 이 방법은 모든 데이터를 삭제합니다!

```bash
# 컨테이너 중지 및 볼륨 삭제
docker compose down -v

# 데이터베이스 컨테이너 시작
docker compose up -d db

# 데이터베이스 준비 대기
sleep 10

# 마이그레이션 실행
docker compose exec app npx prisma@6.1.0 migrate deploy

# 앱 컨테이너 시작
docker compose up -d app

# 로그 확인
docker compose logs app --tail=50
```

## 확인 방법

### 1. 데이터베이스 연결 테스트

```bash
docker compose exec db psql -U app -d ggfinder -c "SELECT 1;"
```

성공하면:
```
 ?column? 
----------
        1
(1 row)
```

### 2. 헬스체크 확인

```bash
curl http://localhost:4000/health | jq .
```

예상 응답:
```json
{
  "status": "ok",
  "database": {
    "status": "connected",
    "latency": 5
  }
}
```

### 3. API 엔드포인트 테스트

```bash
curl http://localhost:4000/api/youtube/public
```

정상 응답:
```json
{
  "videos": [...]
}
```

## 빠른 해결 (한 번에)

```bash
cd /app/ggfinder

# .env 파일 백업
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# POSTGRES_PASSWORD 확인 및 수정
POSTGRES_PASSWORD="ggfinder_secure_pass"  # docker-compose.yml 기본값

# .env 파일 업데이트
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" .env
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://app:${POSTGRES_PASSWORD}@db:5432/ggfinder?schema=public&sslmode=disable|g" .env

# 확인
echo "=== 수정된 설정 ==="
grep -E "POSTGRES_PASSWORD|DATABASE_URL" .env

# 컨테이너 재시작
docker compose restart db
sleep 5
docker compose restart app

# 연결 확인
sleep 5
docker compose exec db psql -U app -d ggfinder -c "SELECT 1;" && echo "✅ 연결 성공" || echo "❌ 연결 실패"
```

## 문제 해결 체크리스트

- [ ] `.env` 파일의 `POSTGRES_PASSWORD` 확인
- [ ] `docker-compose.yml`의 기본값 확인
- [ ] 두 값이 일치하는지 확인
- [ ] `DATABASE_URL`이 올바른 비밀번호를 포함하는지 확인
- [ ] 데이터베이스 컨테이너 재시작
- [ ] 앱 컨테이너 재시작
- [ ] 연결 테스트 성공 확인

