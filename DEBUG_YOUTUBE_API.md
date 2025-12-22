# YouTube API 500 에러 디버깅 가이드

## 문제 발견

네트워크 요청에서 `/api/youtube/public` 엔드포인트가 **500 에러**를 반환하고 있습니다.

## 확인 방법

### 1. 서버 로그 확인

Droplet에서 다음 명령어로 서버 로그 확인:

```bash
# 최근 에러 로그 확인
docker compose logs app --tail=100 | grep -i error

# YouTube 관련 로그 확인
docker compose logs app --tail=100 | grep -i youtube

# 전체 로그 확인
docker compose logs app --tail=200
```

### 2. 데이터베이스 연결 확인

```bash
# 데이터베이스 연결 테스트
docker compose exec app npx prisma@6.1.0 db execute --stdin <<< "SELECT 1;"

# 또는
docker compose exec db psql -U app -d ggfinder -c "SELECT COUNT(*) FROM \"YouTubeVideo\";"
```

### 3. API 엔드포인트 직접 테스트

```bash
# 컨테이너 내부에서 테스트
docker compose exec app wget -O- http://localhost:4000/api/youtube/public

# 또는 외부에서
curl -v https://finder.ggacademy.top/api/youtube/public
```

## 가능한 원인

### 1. 데이터베이스 연결 문제
- Prisma Client가 제대로 생성되지 않음
- 데이터베이스 연결 실패

### 2. 테이블이 존재하지 않음
- 마이그레이션이 실행되지 않음
- `YouTubeVideo` 테이블이 없음

### 3. Prisma 스키마 문제
- 스키마와 데이터베이스 구조 불일치

## 해결 방법

### 방법 1: 데이터베이스 상태 확인

```bash
cd /app/ggfinder

# 마이그레이션 상태 확인
docker compose exec app npx prisma@6.1.0 migrate status

# 마이그레이션 실행 (필요한 경우)
docker compose exec app npx prisma@6.1.0 migrate deploy

# Prisma Client 재생성
docker compose exec app npx prisma@6.1.0 generate
```

### 방법 2: 컨테이너 재시작

```bash
docker compose restart app

# 로그 확인
docker compose logs -f app
```

### 방법 3: 전체 재시작

```bash
docker compose down
docker compose up -d

# 로그 확인
docker compose logs -f app
```

## 빠른 진단 스크립트

```bash
cd /app/ggfinder

echo "=== 데이터베이스 연결 테스트 ==="
docker compose exec db psql -U app -d ggfinder -c "SELECT 1;" || echo "❌ DB 연결 실패"

echo ""
echo "=== YouTubeVideo 테이블 확인 ==="
docker compose exec db psql -U app -d ggfinder -c "SELECT COUNT(*) FROM \"YouTubeVideo\";" || echo "❌ 테이블 없음"

echo ""
echo "=== 마이그레이션 상태 ==="
docker compose exec app npx prisma@6.1.0 migrate status

echo ""
echo "=== API 엔드포인트 테스트 ==="
curl -v http://localhost:4000/api/youtube/public 2>&1 | head -30
```

## 예상 로그

정상적인 경우:
```
✅ 데이터베이스 연결 성공
✅ YouTubeVideo 테이블 존재
✅ 마이그레이션 완료
✅ API 응답: {"videos": [...]}
```

문제가 있는 경우:
```
❌ 데이터베이스 연결 실패
❌ 테이블 없음
❌ 마이그레이션 실패
❌ 500 Internal Server Error
```

