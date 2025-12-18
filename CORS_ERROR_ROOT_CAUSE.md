# CORS 에러가 계속 발생하는 근본 원인 분석

## 🔍 에러 증상

```
Access to fetch at 'http://localhost:4000/api/youtube/public' 
from origin 'https://ggfinder-app-joib6.ondigitalocean.app' 
has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:4000' 
that is not equal to the supplied origin.
```

## 📊 문제 분석

에러 메시지에서 두 가지 문제가 확인됩니다:

### 문제 1: 프론트엔드가 `localhost:4000`을 API URL로 사용
- **증거**: API 호출 URL이 `http://localhost:4000/api/youtube/public`
- **원인**: `VITE_API_BASE_URL`이 빌드 시 설정되지 않음
- **결과**: 프론트엔드가 빌드 시 하드코딩된 기본값(`http://localhost:4000`)을 사용

### 문제 2: 서버가 `localhost:4000`을 CORS origin으로 사용
- **증거**: CORS 헤더가 `http://localhost:4000`을 반환
- **원인**: `CORS_ORIGIN` 또는 `FRONTEND_URL`이 설정되지 않음
- **결과**: 서버가 기본값(`http://localhost:4001`)을 사용하거나 잘못된 값 사용

## 🔎 근본 원인

### 원인 1: `build_command`와 `dockerfile_path` 충돌 가능성

DigitalOcean App Platform에서:
- `dockerfile_path`를 설정하면 자동으로 Docker 빌드 실행
- `build_command`를 설정하면 해당 명령어가 실행됨
- **둘 다 설정하면 `build_command`가 우선되지만, 환경 변수 전달이 제대로 되지 않을 수 있음**

### 원인 2: 환경 변수가 빌드 시점에 사용 불가능

`build_command`에서 `${_self.URL}`을 사용하려고 하지만:
- `build_command` 실행 시점에 `${_self.URL}`이 아직 설정되지 않았을 수 있음
- `VITE_API_BASE_URL` 환경 변수가 빌드 환경에 설정되어 있지만, `build_command`의 쉘 스크립트에서 제대로 참조되지 않을 수 있음

### 원인 3: 빌드 캐시 문제

- 이전 빌드의 캐시된 이미지가 사용되고 있을 수 있음
- 환경 변수가 변경되어도 빌드 캐시 때문에 이전 설정이 사용될 수 있음

### 원인 4: 빌드된 프론트엔드 코드가 이전 빌드 사용

- 배포된 프론트엔드 코드가 여전히 이전 빌드를 사용하고 있을 수 있음
- 브라우저 캐시 문제일 수도 있음

## 🛠️ 해결 방법

### 방법 1: `build_command` 제거하고 다른 방법 사용 (권장)

`build_command`를 제거하고, Dockerfile에서 빌드 전에 `.env` 파일을 생성하는 방식으로 변경:

```dockerfile
# 빌드 전에 .env 파일 생성
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}" > .env && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}" >> .env
```

하지만 이것도 ARG가 없으면 작동하지 않습니다.

### 방법 2: 빌드 전 스크립트 사용

`build_command`에서 빌드 전에 `.env` 파일을 생성:

```yaml
build_command: |
  echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-${_self.URL}}" > .env
  echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID}}" >> .env
  docker build -t app -f Dockerfile .
```

### 방법 3: DigitalOcean 콘솔에서 직접 확인

1. DigitalOcean 콘솔에서 빌드 로그 확인
2. 환경 변수가 제대로 설정되어 있는지 확인
3. 빌드 로그에서 `VITE_API_BASE_URL` 값 확인

## 🔍 확인해야 할 사항

### 1. DigitalOcean 빌드 로그 확인

```bash
doctl apps logs <APP_ID> --type build | grep VITE
```

예상 출력:
```
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
```

만약 `NOT_SET` 또는 `http://localhost:4000`이 표시되면 환경 변수가 전달되지 않은 것입니다.

### 2. DigitalOcean 환경 변수 확인

DigitalOcean 콘솔에서:
- Apps > 앱 선택 > Settings > App-Level Environment Variables
- `VITE_API_BASE_URL`이 설정되어 있는지 확인
- Scope가 `BUILD_TIME`인지 확인
- 값이 `${_self.URL}` 또는 실제 URL인지 확인

### 3. 런타임 로그 확인

```bash
doctl apps logs <APP_ID> --type run | grep CORS
```

예상 출력:
```
CORS_ORIGIN: https://ggfinder-app-joib6.ondigitalocean.app
Allowed Origin: https://ggfinder-app-joib6.ondigitalocean.app
```

만약 `NOT_SET` 또는 `http://localhost:4000`이 표시되면 환경 변수가 설정되지 않은 것입니다.

## 💡 가장 가능성 높은 원인

**`build_command`에서 환경 변수 참조가 제대로 작동하지 않음**

`build_command`의 쉘 스크립트에서:
- `${VITE_API_BASE_URL}`이 빌드 환경에 설정되어 있어도
- 쉘 스크립트에서 제대로 참조되지 않을 수 있음
- `${_self.URL}`이 `build_command` 실행 시점에 아직 사용 불가능할 수 있음

## ✅ 권장 해결책

1. **DigitalOcean 콘솔에서 빌드 로그 확인**
   - 빌드 로그에서 실제로 어떤 값이 사용되었는지 확인

2. **환경 변수 명시적 설정**
   - DigitalOcean 콘솔에서 `VITE_API_BASE_URL`을 명시적으로 설정 (예: `https://ggfinder-app-joib6.ondigitalocean.app`)

3. **빌드 캐시 제거 후 재배포**
   - DigitalOcean 콘솔에서 빌드 캐시를 제거하고 재배포

4. **브라우저 캐시 삭제**
   - 브라우저에서 하드 리프레시 (Ctrl+Shift+R 또는 Cmd+Shift+R)

