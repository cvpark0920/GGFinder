# DigitalOcean App Platform 디버깅 가이드

## 1. 로그 확인 방법

### DigitalOcean 대시보드에서 확인
1. **DigitalOcean 대시보드 접속**
   - https://cloud.digitalocean.com/apps 접속
   - 앱 선택

2. **Runtime Logs 확인**
   - 왼쪽 메뉴에서 "Runtime Logs" 클릭
   - 실시간 로그 확인 가능
   - 빌드 로그와 런타임 로그 분리되어 표시

3. **Build Logs 확인**
   - "Build Logs" 탭에서 빌드 과정 확인
   - 에러 발생 시 상세한 에러 메시지 확인

### CLI를 통한 로그 확인
```bash
# doctl 설치 (macOS)
brew install doctl

# DigitalOcean 로그인
doctl auth init

# 앱 목록 확인
doctl apps list

# 앱 로그 확인
doctl apps logs <APP_ID> --type run
doctl apps logs <APP_ID> --type build
```

## 2. SSH 접근 방법

### App Platform의 경우
DigitalOcean App Platform은 **완전한 SSH 접근을 제공하지 않습니다**. 대신:

1. **Console 기능 사용** (제한적)
   - App Platform 대시보드에서 "Console" 탭 확인
   - 일부 앱에서만 사용 가능

2. **로컬에서 프로덕션 환경 시뮬레이션**
   ```bash
   # 프로덕션 의존성만 설치
   npm ci --only=production
   
   # Prisma CLI 설치 확인
   npm install prisma@6.1.0 --save-dev
   
   # 서버 실행
   PORT=4000 NODE_ENV=production node server/dist/index.js
   ```

### Droplet을 사용하는 경우
만약 Droplet을 사용한다면:

```bash
# SSH 접속
ssh root@<DROPLET_IP>

# 또는 사용자 계정으로
ssh <USERNAME>@<DROPLET_IP>

# 앱 디렉토리로 이동
cd /path/to/app

# 로그 확인
tail -f /var/log/app.log

# 프로세스 확인
ps aux | grep node

# 포트 확인
netstat -tlnp | grep 4000
# 또는
lsof -i :4000
```

## 3. 디버깅을 위한 추가 로깅

### app.yaml에 디버깅 명령 추가
```yaml
run_command: |
  echo "=== Environment Debug Info ==="
  echo "Working Directory: $(pwd)"
  echo "Files in current directory:"
  ls -la
  echo ""
  echo "Files in server/dist:"
  ls -la server/dist/ || echo "server/dist not found"
  echo ""
  echo "Files in build:"
  ls -la build/ || echo "build not found"
  echo ""
  echo "Node modules:"
  ls -la node_modules/.bin/ | grep -E "(prisma|node)" || echo "node_modules/.bin not found"
  echo ""
  echo "Environment Variables:"
  echo "PORT: ${PORT}"
  echo "NODE_ENV: ${NODE_ENV}"
  echo "DATABASE_URL: ${DATABASE_URL:+SET}"
  echo ""
  # ... 나머지 명령어들
```

## 4. 로컬에서 프로덕션 환경 재현

```bash
# 1. 프로덕션 의존성만 설치
npm ci --only=production

# 2. Prisma CLI 설치 (런타임에 필요)
npm install prisma@6.1.0 --save-dev

# 3. Prisma Client 생성
npx prisma@6.1.0 generate

# 4. 환경 변수 설정
export NODE_ENV=production
export PORT=4000
export DATABASE_URL="your-database-url"

# 5. 서버 실행
node server/dist/index.js
```

## 5. 주요 확인 사항

### 파일 존재 확인
- `server/dist/index.js` 존재 여부
- `build/index.html` 존재 여부
- `node_modules/.bin/prisma` 존재 여부

### 환경 변수 확인
- `PORT` 설정 여부
- `DATABASE_URL` 설정 여부
- `NODE_ENV` 설정 여부

### 프로세스 확인
- Node.js 프로세스 실행 여부
- 포트 4000 리스닝 여부
- 에러 메시지 확인

