# 누락된 avatarUrl 컬럼 수정 가이드

## 문제 상황

데이터베이스에 `clients.avatarUrl` 컬럼이 없어서 다음 오류가 발생합니다:

```
Invalid `prisma.client.findMany()` invocation:
The column `clients.avatarUrl` does not exist in the current database.
Prisma Error Code: P2022
```

## 원인

마이그레이션 `20251216090000_add_avatar_url`이 데이터베이스에 적용되지 않았습니다.

## 해결 방법

### 방법 1: 자동 수정 스크립트 (권장)

Droplet에서 다음 명령어를 실행하세요:

```bash
cd /app/ggfinder
git pull
./scripts/fix-missing-avatar-url-column.sh
```

이 스크립트가 자동으로:
1. Prisma 마이그레이션 상태 확인
2. 직접 SQL로 컬럼 추가
3. 마이그레이션 재적용
4. Prisma Client 재생성
5. 컨테이너 재시작

### 방법 2: 수동 수정

#### 2-1. 컬럼 직접 추가

```bash
cd /app/ggfinder

# 데이터베이스에 직접 접속하여 컬럼 추가
docker compose exec db psql -U app -d ggfinder -c \
  "ALTER TABLE \"clients\" ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT;"
```

#### 2-2. 마이그레이션 해결

```bash
# 마이그레이션을 적용된 것으로 표시
docker compose exec app npx prisma@6.1.0 migrate resolve --applied 20251216090000_add_avatar_url

# 마이그레이션 재배포
docker compose exec app npx prisma@6.1.0 migrate deploy
```

#### 2-3. Prisma Client 재생성

```bash
docker compose exec app npx prisma@6.1.0 generate
```

#### 2-4. 컨테이너 재시작

```bash
docker compose restart app
```

### 방법 3: CI/CD 재배포

GitHub Actions가 자동으로 마이그레이션을 확인하고 적용합니다:

1. GitHub 저장소에 푸시
2. GitHub Actions가 자동으로 배포 실행
3. Dockerfile의 CMD에서 마이그레이션 자동 해결

## 확인 방법

### 컬럼 존재 확인

```bash
docker compose exec db psql -U app -d ggfinder -c \
  "SELECT column_name FROM information_schema.columns WHERE table_name='clients' AND column_name='avatarUrl';"
```

### 마이그레이션 상태 확인

```bash
docker compose exec app npx prisma@6.1.0 migrate status
```

### 헬스체크 확인

```bash
curl http://localhost:4000/health
```

### 로그 확인

```bash
docker compose logs app --tail=50 | grep -i "avatarUrl\|P2022\|error"
```

## 예방 조치

Dockerfile과 배포 워크플로우에 다음이 포함되어 있습니다:

1. **Dockerfile**: 마이그레이션 전에 `avatarUrl` 마이그레이션을 자동으로 해결
2. **배포 워크플로우**: 마이그레이션 실패 시 자동 해결 시도

## 관련 파일

- `prisma/migrations/20251216090000_add_avatar_url/migration.sql`: avatarUrl 컬럼 추가 마이그레이션
- `prisma/schema.prisma`: Client 모델에 `avatarUrl String?` 필드 정의
- `server/routes/clients.ts`: `avatarUrl` 필드 사용
- `scripts/fix-missing-avatar-url-column.sh`: 자동 수정 스크립트

