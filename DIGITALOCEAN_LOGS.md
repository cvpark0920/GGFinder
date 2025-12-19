# DigitalOcean 로그 모니터링 가이드

이 문서는 DigitalOcean App Platform에서 배포된 애플리케이션의 백엔드 로그를 모니터링하는 방법을 설명합니다.

## 📋 로그 확인 방법

### 방법 1: DigitalOcean 웹 콘솔 (가장 쉬운 방법)

1. **DigitalOcean 콘솔 접속**
   - [DigitalOcean Apps 페이지](https://cloud.digitalocean.com/apps)로 이동
   - 배포된 앱 선택

2. **런타임 로그 확인**
   - 앱 페이지에서 **"Runtime Logs"** 탭 클릭
   - 실시간 로그 스트림 확인 가능
   - 필터링 옵션 사용 가능

3. **빌드 로그 확인**
   - **"Build Logs"** 탭 클릭
   - 배포 시 빌드 과정의 로그 확인

4. **배포 로그 확인**
   - **"Deployments"** 탭 클릭
   - 특정 배포 선택 후 상세 로그 확인

### 방법 2: doctl CLI 사용 (터미널)

#### doctl 설치

```bash
# macOS
brew install doctl

# Linux
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-darwin-amd64.tar.gz
tar xf doctl-1.104.0-darwin-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

#### 인증 설정

```bash
# DigitalOcean API 토큰으로 인증
doctl auth init
# API 토큰 입력 (DigitalOcean 콘솔 > API > Tokens에서 생성)
```

#### 로그 확인 명령어

```bash
# App ID 확인
doctl apps list

# 런타임 로그 확인 (실시간)
doctl apps logs <APP_ID> --type run --follow

# 런타임 로그 확인 (최근 100줄)
doctl apps logs <APP_ID> --type run --tail 100

# 빌드 로그 확인
doctl apps logs <APP_ID> --type build

# 특정 배포의 로그 확인
doctl apps logs <APP_ID> --deployment <DEPLOYMENT_ID> --type run

# 에러만 필터링
doctl apps logs <APP_ID> --type run | grep -i error

# 특정 시간대 로그 확인
doctl apps logs <APP_ID> --type run --since 1h
```

#### 유용한 옵션

- `--follow` 또는 `-f`: 실시간 로그 스트림 (tail -f와 유사)
- `--tail <N>`: 최근 N줄만 표시
- `--since <duration>`: 특정 시간 이후의 로그만 표시 (예: 1h, 30m, 1d)
- `--type <type>`: 로그 타입 선택 (`run`, `build`, `deploy`)

### 방법 3: API 사용 (고급)

```bash
# API 토큰 설정
export DIGITALOCEAN_TOKEN="your-api-token"

# 로그 조회
curl -X GET \
  "https://api.digitalocean.com/v2/apps/<APP_ID>/logs" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json"
```

## 🔍 로그 필터링 및 검색

### 웹 콘솔에서 필터링

1. Runtime Logs 탭에서 검색창 사용
2. 키워드 입력 (예: `error`, `Client creation`)
3. 시간 범위 선택

### CLI에서 필터링

```bash
# 에러 로그만 확인
doctl apps logs <APP_ID> --type run --follow | grep -i error

# 특정 API 엔드포인트 로그 확인
doctl apps logs <APP_ID> --type run --follow | grep "/api/clients"

# 클라이언트 생성 관련 로그만 확인
doctl apps logs <APP_ID> --type run --tail 500 | grep -i "client creation"

# JSON 형식 로그 파싱
doctl apps logs <APP_ID> --type run --tail 100 | jq '.'
```

## 📊 로그 분석 팁

### 일반적인 에러 패턴

1. **500 Internal Server Error**
   - 서버 로그에서 스택 트레이스 확인
   - 데이터베이스 연결 문제 확인
   - 환경 변수 누락 확인

2. **404 Not Found**
   - 라우팅 문제 확인
   - 파일 경로 문제 확인

3. **401/403 Unauthorized**
   - 인증/인가 미들웨어 로그 확인
   - 토큰 검증 실패 원인 확인

### 로그에서 확인할 항목

- `Client creation error:` - 클라이언트 생성 에러
- `Error stack:` - 스택 트레이스
- `Request body:` - 요청 본문
- `Request files:` - 업로드된 파일 정보
- `PrismaClientInitializationError` - 데이터베이스 연결 에러

## 🚨 실시간 모니터링 스크립트

### 간단한 모니터링 스크립트

```bash
#!/bin/bash
# monitor-logs.sh

APP_ID="your-app-id"

echo "실시간 로그 모니터링 시작..."
echo "에러가 발생하면 Ctrl+C로 종료하세요"
echo ""

doctl apps logs $APP_ID --type run --follow | \
  grep --line-buffered -E "(error|Error|ERROR|exception|Exception|EXCEPTION)" | \
  while read line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line"
  done
```

### 사용 방법

```bash
chmod +x monitor-logs.sh
./monitor-logs.sh
```

## 📝 로그 저장

### 로그를 파일로 저장

```bash
# 로그를 파일로 저장
doctl apps logs <APP_ID> --type run --tail 1000 > logs-$(date +%Y%m%d-%H%M%S).txt

# 실시간 로그를 파일로 저장
doctl apps logs <APP_ID> --type run --follow | tee app-logs-$(date +%Y%m%d-%H%M%S).log
```

## 🔧 문제 해결

### 로그가 보이지 않는 경우

1. 앱이 실행 중인지 확인
2. App ID가 올바른지 확인
3. API 토큰 권한 확인 (Read 권한 필요)

### 로그가 너무 많은 경우

- 필터링 옵션 사용
- 특정 시간대만 확인
- 에러만 필터링

### 로그 지연

- DigitalOcean 로그는 약간의 지연이 있을 수 있음
- 실시간 모니터링을 위해 `--follow` 옵션 사용

## 📚 추가 리소스

- [DigitalOcean App Platform 로그 문서](https://docs.digitalocean.com/products/app-platform/how-to/view-logs/)
- [doctl 로그 명령어 문서](https://docs.digitalocean.com/reference/doctl/reference/apps/logs/)

