# GitHub Secrets 설정 가이드

## 🔍 왜 GitHub Secrets에 실제 값을 설정해야 하나요?

CI에서 실제 `VITE_GOOGLE_CLIENT_ID` 값을 사용하면:
- ✅ 빌드가 실제 프로덕션 환경과 동일하게 테스트됨
- ✅ 빌드된 프론트엔드 코드가 올바른 클라이언트 ID를 포함하는지 확인 가능
- ✅ 더 정확한 빌드 검증 가능

**참고:** Google OAuth 클라이언트 ID는 공개 정보이므로 GitHub Secrets에 저장해도 보안 문제가 없습니다.

## 📋 설정 방법

### 1. GitHub 저장소에서 Secrets 설정

1. **GitHub 저장소 접속**
   - https://github.com/cvpark0920/GGFinder
   - Settings > Secrets and variables > Actions

2. **New repository secret 클릭**

3. **VITE_GOOGLE_CLIENT_ID 추가**
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Secret: Google OAuth 클라이언트 ID (예: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`)
   - Add secret

4. **VITE_API_BASE_URL도 추가 (선택사항)**
   - Name: `VITE_API_BASE_URL`
   - Secret: 프로덕션 URL (예: `https://ggfinder-app-joib6.ondigitalocean.app`)
   - Add secret

### 2. Google OAuth 클라이언트 ID 찾기

Google Cloud Console에서 클라이언트 ID 확인:

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/apis/credentials

2. **OAuth 2.0 클라이언트 ID 선택**

3. **클라이언트 ID 복사**
   - 예: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`

### 3. 로컬에서 확인

로컬 환경 변수 파일에서 확인:

```bash
# .env 파일 또는 환경 변수에서 확인
echo $GOOGLE_CLIENT_ID
# 또는
cat .env | grep GOOGLE_CLIENT_ID
```

## 🔍 확인 방법

### 1. GitHub Actions 로그 확인

CI 빌드 후 Actions 탭에서 로그 확인:

1. **Actions 탭** 선택
2. 최신 워크플로우 실행 선택
3. **Docker build test** 작업 확인
4. 빌드 로그에서 다음 확인:

**정상인 경우:**
```
=== Build arguments ===
VITE_API_BASE_URL=https://ggfinder-app-joib6.ondigitalocean.app
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
✅ Environment variables verified successfully
```

**에러가 있는 경우 (더미 값 사용):**
```
VITE_GOOGLE_CLIENT_ID=ci-test-client-id-123456789
```

### 2. 빌드된 파일 확인

CI에서 빌드된 파일 확인 (고급):

```bash
# CI 로그에서 빌드된 .env 파일 내용 확인
cat .env
```

## ⚠️ 주의사항

1. **보안**
   - Google OAuth 클라이언트 ID는 공개 정보이므로 GitHub Secrets에 저장해도 안전합니다
   - 하지만 클라이언트 시크릿(`GOOGLE_CLIENT_SECRET`)은 절대 GitHub Secrets에 저장하지 마세요

2. **값 확인**
   - GitHub Secrets에 저장된 값이 `GOOGLE_CLIENT_ID`와 정확히 동일한지 확인
   - 공백이나 특수문자 확인

3. **업데이트**
   - Google Cloud Console에서 클라이언트 ID를 변경하면 GitHub Secrets도 업데이트 필요

## 📝 체크리스트

- [ ] GitHub 저장소 Settings > Secrets and variables > Actions 접속
- [ ] `VITE_GOOGLE_CLIENT_ID` Secret 추가
- [ ] Google OAuth 클라이언트 ID 값 입력
- [ ] `VITE_API_BASE_URL` Secret 추가 (선택사항)
- [ ] CI 빌드 실행
- [ ] 빌드 로그에서 실제 값 확인
- [ ] "✅ Environment variables verified successfully" 메시지 확인

## 🔧 문제 해결

### Secret이 적용되지 않는 경우

1. **Secret 이름 확인**
   - 정확히 `VITE_GOOGLE_CLIENT_ID`인지 확인 (대소문자 구분)

2. **워크플로우 파일 확인**
   - `.github/workflows/ci.yml`에서 `secrets.VITE_GOOGLE_CLIENT_ID` 참조 확인

3. **빌드 재실행**
   - Secrets를 추가한 후 워크플로우를 수동으로 재실행

### 로컬 값 찾기

로컬에서 실제 값을 확인하는 방법:

```bash
# .env 파일 확인
cat .env | grep GOOGLE_CLIENT_ID

# 또는 환경 변수 확인
echo $GOOGLE_CLIENT_ID

# 또는 Google Cloud Console에서 직접 확인
# https://console.cloud.google.com/apis/credentials
```

