# 빠른 배포 가이드

## 🚀 5분 안에 배포하기

### 1단계: DigitalOcean API 토큰 생성 (2분)

1. [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens) 접속
2. "Generate New Token" 클릭
3. 이름: `GitHub Actions Deploy`
4. 권한: `Write` 선택
5. 토큰 생성 후 복사

### 2단계: GitHub Secrets 설정 (2분)

1. GitHub 저장소 > Settings > Secrets and variables > Actions
2. 다음 Secrets 추가:

```
DIGITALOCEAN_ACCESS_TOKEN: <1단계에서 복사한 토큰>
```

### 3단계: DigitalOcean 앱 생성 (1분)

#### 옵션 A: 웹 콘솔 사용 (가장 쉬움)

1. [DigitalOcean Apps](https://cloud.digitalocean.com/apps) 접속
2. "Create App" > "GitHub" 선택
3. 저장소: `cvpark0920/GGFinder` 선택
4. 브랜치: `main` 선택
5. **빌드 타입**: **"Docker build detected"** 선택 ⚠️
6. "Autodeploy" 활성화
7. 환경 변수 설정 (아래 참조)
8. "Create Resources" 클릭

#### 옵션 B: CLI 사용

```bash
# doctl 설치
brew install doctl

# 인증
doctl auth init

# 앱 생성
doctl apps create --spec app.yaml
```

### 4단계: 환경 변수 설정

DigitalOcean 콘솔에서 앱 > Settings > App-Level Environment Variables:

**런타임 변수 (Runtime):**
- `JWT_SECRET`: 임의의 긴 문자열 (예: `openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿

**빌드 타임 변수 (Build Time):**
- `VITE_API_BASE_URL`: 앱 생성 후 자동으로 설정됨 (`${_self.URL}`)

### 5단계: 배포 확인

1. GitHub에 푸시:
   ```bash
   git push origin main
   ```

2. GitHub Actions에서 배포 진행 상황 확인

3. DigitalOcean 콘솔에서 앱 상태 확인

4. 앱 URL로 접속하여 확인

## ✅ 배포 체크리스트

- [ ] DigitalOcean API 토큰 생성 완료
- [ ] GitHub Secrets에 `DIGITALOCEAN_ACCESS_TOKEN` 추가
- [ ] DigitalOcean 앱 생성 완료
- [ ] 환경 변수 설정 완료 (JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] 데이터베이스 연결 확인
- [ ] GitHub Actions 워크플로우 실행 확인
- [ ] 앱 URL 접속 테스트

## 🔍 배포 후 확인사항

1. **헬스 체크**
   ```bash
   curl https://your-app.ondigitalocean.app/health
   ```

2. **로그 확인**
   ```bash
   doctl apps logs <APP_ID> --type run
   ```

3. **데이터베이스 연결 확인**
   - 로그에서 "DATABASE_URL: SET" 확인
   - Prisma 마이그레이션 성공 확인

## 📝 다음 단계

배포가 완료되면:

1. [DEPLOYMENT.md](./DEPLOYMENT.md)에서 상세한 설정 방법 확인
2. 모니터링 및 로그 설정
3. 백업 전략 수립
4. 도메인 연결 (선택사항)

## 🆘 문제 해결

배포 중 문제가 발생하면:

1. [DEPLOYMENT.md](./DEPLOYMENT.md)의 트러블슈팅 섹션 참조
2. GitHub Actions 로그 확인
3. DigitalOcean 앱 로그 확인
4. 환경 변수 재확인

