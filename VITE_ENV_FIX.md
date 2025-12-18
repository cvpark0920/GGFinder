# VITE_GOOGLE_CLIENT_ID 에러 근본 원인 및 해결

## 🔍 근본 원인

**DigitalOcean App Platform의 Docker 빌드 제한사항:**

DigitalOcean App Platform에서 Docker 빌드를 사용할 때, `BUILD_TIME` scope의 환경 변수는:
- ✅ 빌드 환경의 **환경 변수**로는 사용 가능
- ❌ Docker 빌드의 **ARG**로는 자동 전달되지 않음

즉, `app.yaml`에서 `BUILD_TIME`으로 설정한 환경 변수는:
- 빌드 스크립트나 명령어에서는 사용 가능
- 하지만 Docker 빌드의 `--build-arg`로는 자동 전달되지 않음

## 🛠️ 해결 방법

### 방법 1: Dockerfile에서 환경 변수 직접 읽기 (권장)

Dockerfile을 수정하여 ARG와 ENV를 모두 사용:

```dockerfile
# ARG는 --build-arg로 전달되거나, 없으면 환경 변수에서 읽음
ARG VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
```

이렇게 하면:
- `--build-arg`로 전달되면 ARG 값 사용
- 전달되지 않으면 빌드 환경의 환경 변수 값 사용

### 방법 2: 빌드 스크립트 사용 (대안)

`app.yaml`에 `build_command`를 추가하여 환경 변수를 명시적으로 전달:

```yaml
build_command: |
  docker build \
    --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    --build-arg VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    -t app .
```

하지만 이 방법은 Docker 빌드의 장점을 잃게 됨.

### 방법 3: .env 파일 생성 (대안)

빌드 전에 `.env` 파일을 생성:

```yaml
build_command: |
  echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env
  echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}" >> .env
  docker build -t app .
```

## ✅ 적용된 해결책

`app.yaml`에 `build_command`를 추가하여 빌드 타임 환경 변수를 Docker ARG로 명시적으로 전달하도록 수정했습니다.

### 변경 사항

**app.yaml:**
```yaml
build_command: |
  docker build \
    --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-${_self.URL}}" \
    --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID}}" \
    -t app \
    -f Dockerfile \
    .
```

**Dockerfile:**
```dockerfile
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
```

이렇게 하면:
- `build_command`에서 `--build-arg`로 환경 변수를 명시적으로 전달
- Dockerfile의 ARG가 빌드 타임 환경 변수 값을 받음
- Vite 빌드 시 환경 변수가 프론트엔드 코드에 포함됨

### 주의사항

- `build_command`를 설정하면 `dockerfile_path`는 무시되고 `build_command`가 실행됨
- 따라서 `build_command`에서 `-f Dockerfile`을 명시해야 함

## 🔍 확인 방법

### 1. 빌드 로그 확인

DigitalOcean 콘솔에서 빌드 로그를 확인:

```bash
doctl apps logs <APP_ID> --type build | grep VITE
```

다음과 같이 표시되어야 함:
```
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

### 2. 빌드된 파일 확인

배포 후 브라우저에서:
1. 개발자 도구 > Sources 탭
2. 빌드된 JavaScript 파일 확인
3. `VITE_GOOGLE_CLIENT_ID`가 실제 값으로 대체되었는지 확인

### 3. 런타임 확인

브라우저 콘솔에서:
```javascript
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

값이 출력되어야 함 (undefined가 아니어야 함).

## ⚠️ 주의사항

### 환경 변수 설정 확인

DigitalOcean 콘솔에서 다음을 확인:

1. **VITE_GOOGLE_CLIENT_ID** 환경 변수가 설정되어 있는지
2. **Scope가 BUILD_TIME**인지 확인
3. **값이 GOOGLE_CLIENT_ID와 동일한지** 확인

### 재배포 필요

Dockerfile을 수정한 후:
- 코드를 커밋하고 푸시
- DigitalOcean에서 자동 재배포 또는 수동 배포
- 빌드 캐시가 있으면 완전히 새로 빌드됨

## 🆘 여전히 문제가 있는 경우

### 1. 빌드 로그에서 환경 변수 확인

```bash
doctl apps logs <APP_ID> --type build
```

빌드 로그에서 다음을 확인:
- `VITE_GOOGLE_CLIENT_ID=NOT_SET` → 환경 변수가 설정되지 않음
- `VITE_GOOGLE_CLIENT_ID=your-value` → 정상

### 2. DigitalOcean 콘솔에서 재확인

1. Apps > 앱 선택
2. Settings > App-Level Environment Variables
3. `VITE_GOOGLE_CLIENT_ID` 변수가 있는지 확인
4. Scope가 `BUILD_TIME`인지 확인
5. 값이 올바른지 확인

### 3. 앱 재생성 (최후의 수단)

만약 여전히 작동하지 않으면:
1. 기존 앱 삭제
2. `app.yaml`을 사용하여 앱 재생성
3. 환경 변수 다시 설정

## 📚 참고

- [DigitalOcean App Platform 환경 변수 문서](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [Docker ARG vs ENV](https://docs.docker.com/engine/reference/builder/#arg)

