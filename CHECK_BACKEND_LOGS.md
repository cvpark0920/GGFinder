# 백엔드 로그 확인 가이드

## 기본 명령어

### 1. 실시간 로그 확인 (가장 유용)

```bash
# 모든 서비스 로그 실시간 확인
docker compose logs -f

# 앱(백엔드) 로그만 실시간 확인
docker compose logs -f app

# 데이터베이스 로그만 실시간 확인
docker compose logs -f db
```

**사용법**: `Ctrl+C`로 종료

### 2. 최근 로그 확인

```bash
# 최근 100줄 확인
docker compose logs app --tail=100

# 최근 200줄 확인
docker compose logs app --tail=200

# 최근 500줄 확인
docker compose logs app --tail=500
```

### 3. 특정 키워드 필터링

```bash
# 에러만 확인
docker compose logs app | grep -i error

# 에러와 경고 확인
docker compose logs app | grep -i "error\|warn"

# YouTube 관련 로그만 확인
docker compose logs app | grep -i youtube

# 데이터베이스 관련 로그만 확인
docker compose logs app | grep -i "database\|prisma\|db"

# Google OAuth 관련 로그만 확인
docker compose logs app | grep -i "google\|oauth"

# 특정 시간 이후 로그 확인
docker compose logs app --since 10m  # 10분 전부터
docker compose logs app --since 1h   # 1시간 전부터
```

### 4. 컨텍스트 포함 필터링

```bash
# 에러 주변 10줄 확인
docker compose logs app | grep -A 10 -B 10 -i error

# YouTube 에러 주변 20줄 확인
docker compose logs app | grep -A 20 -B 5 -i "youtube.*error"
```

## 유용한 조합 명령어

### 에러 로그만 최근 50줄

```bash
docker compose logs app --tail=200 | grep -i error | tail -50
```

### 특정 시간대 로그

```bash
# 최근 30분 로그
docker compose logs app --since 30m

# 특정 시간 이후
docker compose logs app --since 2025-12-22T05:00:00
```

### 여러 키워드 동시 검색

```bash
# 에러 또는 실패 관련 로그
docker compose logs app --tail=500 | grep -iE "error|fail|exception"

# 데이터베이스 또는 Prisma 관련 에러
docker compose logs app --tail=500 | grep -iE "database|prisma|db" | grep -i error
```

## 실전 예시

### YouTube API 500 에러 확인

```bash
# YouTube 관련 에러 확인
docker compose logs app --tail=200 | grep -A 10 -B 5 -i "youtube.*error\|youtube.*fail"

# 또는
docker compose logs app --tail=200 | grep -i youtube
```

### 데이터베이스 연결 문제 확인

```bash
# DB 관련 에러 확인
docker compose logs app --tail=200 | grep -A 10 -B 5 -iE "database|prisma|db.*error"

# Prisma Client 초기화 확인
docker compose logs app | grep -A 5 "PrismaClient\|DATABASE_URL"
```

### Google OAuth 문제 확인

```bash
# Google OAuth 관련 로그
docker compose logs app --tail=200 | grep -A 10 -B 5 -i "google.*oauth\|oauth.*error"

# 또는
docker compose logs app | grep -A 10 "Google OAuth Config"
```

### 전체 에러 로그 확인

```bash
# 모든 에러를 시간순으로 확인
docker compose logs app | grep -i error | tail -100

# 에러와 경고 함께 확인
docker compose logs app | grep -iE "error|warn" | tail -100
```

## 로그 파일로 저장

```bash
# 로그를 파일로 저장
docker compose logs app --tail=1000 > backend_logs_$(date +%Y%m%d_%H%M%S).txt

# 에러만 파일로 저장
docker compose logs app --tail=1000 | grep -i error > errors_$(date +%Y%m%d_%H%M%S).txt
```

## 실시간 모니터링

```bash
# 실시간으로 에러만 필터링해서 보기
docker compose logs -f app | grep --line-buffered -i error

# 실시간으로 여러 키워드 필터링
docker compose logs -f app | grep --line-buffered -iE "error|warn|fail"
```

## 컨테이너 내부에서 직접 확인

```bash
# 컨테이너 내부 접속
docker compose exec app sh

# 내부에서 로그 파일 확인 (있는 경우)
ls -la /app/logs/
cat /app/logs/*.log

# 또는 Node.js 애플리케이션 로그
# (애플리케이션이 파일로 로그를 남기는 경우)
```

## 빠른 확인 명령어 모음

```bash
# === 전체 상태 확인 ===
echo "=== 컨테이너 상태 ===" && \
docker compose ps && \
echo "" && \
echo "=== 최근 에러 로그 ===" && \
docker compose logs app --tail=50 | grep -i error | tail -10 && \
echo "" && \
echo "=== 헬스체크 ===" && \
curl -s http://localhost:4000/health | jq . 2>/dev/null || curl -s http://localhost:4000/health
```

## 문제 해결 시나리오

### 시나리오 1: YouTube API 500 에러

```bash
# 1. 최근 에러 확인
docker compose logs app --tail=100 | grep -A 10 -B 5 -i "youtube\|error"

# 2. 데이터베이스 연결 확인
docker compose logs app | grep -i "database\|prisma"

# 3. 전체 로그 확인
docker compose logs app --tail=200
```

### 시나리오 2: 서버가 시작되지 않음

```bash
# 1. 컨테이너 상태 확인
docker compose ps

# 2. 시작 로그 확인
docker compose logs app --tail=100

# 3. 에러 확인
docker compose logs app | grep -i error | tail -20
```

### 시나리오 3: 특정 API 엔드포인트 문제

```bash
# 해당 엔드포인트 관련 로그만 확인
docker compose logs app --tail=500 | grep -i "youtube/public\|/api/youtube"
```

## 팁

1. **실시간 로그**: 문제 재현 시 `docker compose logs -f app` 사용
2. **에러 필터링**: `grep -i error`로 에러만 빠르게 확인
3. **컨텍스트**: `-A 10 -B 5`로 에러 전후 맥락 확인
4. **시간 범위**: `--since` 옵션으로 특정 시간 이후 로그만 확인
5. **로그 저장**: 중요한 에러는 파일로 저장하여 분석

