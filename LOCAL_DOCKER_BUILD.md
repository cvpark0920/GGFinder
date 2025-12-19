# 로컬 Docker 빌드 가이드

## 🔍 문제

로컬 Docker 환경에서 프론트엔드를 빌드할 때 `VITE_GOOGLE_CLIENT_ID is not set in environment variables` 에러 발생

## ✅ 해결 방법

### 1. .env 파일 확인

로컬 `.env` 파일에 다음이 설정되어 있어야 합니다:

```bash
GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
```

또는 `VITE_GOOGLE_CLIENT_ID`가 없으면 `GOOGLE_CLIENT_ID`를 사용합니다.

### 2. docker-compose.yml 수정

`docker-compose.yml`의 build args에 `VITE_GOOGLE_CLIENT_ID` 추가:

```yaml
build:
  args:
    VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:4000}
    VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}
```

### 3. Docker 빌드 및 실행

```bash
# 이미지 재빌드 (캐시 없이)
docker-compose build --no-cache app

# 또는 전체 재빌드
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 4. 빌드 로그 확인

빌드 시 다음 메시지가 보여야 합니다:

```
=== Build arguments ===
VITE_API_BASE_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
✅ Environment variables verified successfully
```

## 🔧 문제 해결

### 에러가 계속 발생하는 경우

1. **환경 변수 확인**
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $VITE_GOOGLE_CLIENT_ID
   ```

2. **.env 파일 확인**
   ```bash
   cat .env | grep GOOGLE_CLIENT_ID
   ```

3. **Docker 이미지 재빌드**
   ```bash
   docker-compose build --no-cache app
   docker-compose up -d
   ```

4. **브라우저 캐시 클리어**
   - 브라우저 개발자 도구 > Network 탭 > "Disable cache" 체크
   - 또는 시크릿 모드에서 테스트

## 📝 참고사항

- `VITE_GOOGLE_CLIENT_ID`는 빌드 타임에만 필요합니다
- 런타임에는 `GOOGLE_CLIENT_ID`만 필요합니다
- 로컬에서는 `.env` 파일에서 환경 변수를 로드합니다
