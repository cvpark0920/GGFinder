# .env 파일 수정 가이드

## 현재 문제점

1. **중복된 환경 변수**: HTTPS와 HTTP 버전이 모두 정의되어 있음
   - 마지막에 정의된 값이 사용되므로 HTTP로 설정됨
   - `VITE_API_BASE_URL`, `CORS_ORIGIN`, `FRONTEND_URL` 중복

2. **누락된 환경 변수**: `VITE_GOOGLE_CLIENT_ID`가 없음
   - Google OAuth가 작동하지 않는 원인

## 수정된 .env 파일

다음 내용으로 `.env` 파일을 교체하세요:

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=A7G8iGOtWaCXr409gKct6bdi0O69SMvyuGrDoXZNFg4=
GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
POSTGRES_USER=app
POSTGRES_PASSWORD=ggfinder_secure_pass
POSTGRES_DB=ggfinder
POSTGRES_PORT=5432
DATABASE_URL=postgresql://app:ggfinder_secure_pass@db:5432/ggfinder?schema=public&sslmode=disable

# 프론트엔드 및 API URL 설정 (빌드 타임 환경 변수 포함)
VITE_API_BASE_URL=https://finder.ggacademy.top
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
```

## 주요 변경사항

1. ✅ **중복 제거**: HTTP 버전 제거, HTTPS 버전만 유지
2. ✅ **VITE_GOOGLE_CLIENT_ID 추가**: Google OAuth 작동을 위해 필수
3. ✅ **HTTPS로 통일**: 모든 URL을 HTTPS로 설정

## 적용 방법

### 방법 1: 직접 수정 (Droplet에서)

```bash
cd /app/ggfinder

# 백업
cp .env .env.backup

# .env 파일 수정
nano .env
# 위의 수정된 내용으로 교체

# 재빌드 (VITE_GOOGLE_CLIENT_ID가 빌드 타임 환경 변수이므로 필수)
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 방법 2: 스크립트 사용

```bash
cd /app/ggfinder

# 백업
cp .env .env.backup

# 수정된 .env 파일 생성
cat > .env << 'EOF'
NODE_ENV=production
PORT=4000
JWT_SECRET=A7G8iGOtWaCXr409gKct6bdi0O69SMvyuGrDoXZNFg4=
GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
POSTGRES_USER=app
POSTGRES_PASSWORD=ggfinder_secure_pass
POSTGRES_DB=ggfinder
POSTGRES_PORT=5432
DATABASE_URL=postgresql://app:ggfinder_secure_pass@db:5432/ggfinder?schema=public&sslmode=disable

# 프론트엔드 및 API URL 설정 (빌드 타임 환경 변수 포함)
VITE_API_BASE_URL=https://finder.ggacademy.top
VITE_GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
CORS_ORIGIN=https://finder.ggacademy.top
FRONTEND_URL=https://finder.ggacademy.top
EOF

# 재빌드
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 확인

```bash
# 환경 변수 확인
cat .env | grep -E "VITE_API_BASE_URL|VITE_GOOGLE_CLIENT_ID|CORS_ORIGIN|FRONTEND_URL"

# 중복 확인 (중복이 없어야 함)
cat .env | grep -E "VITE_API_BASE_URL|CORS_ORIGIN|FRONTEND_URL" | wc -l
# 결과: 4 (각각 1개씩)

# 컨테이너 로그 확인
docker compose logs -f app
```

## 주의사항

1. **재빌드 필수**: `VITE_GOOGLE_CLIENT_ID`와 `VITE_API_BASE_URL`은 빌드 타임 환경 변수이므로 반드시 재빌드해야 합니다.

2. **HTTPS 통일**: 모든 URL을 HTTPS로 설정하여 Mixed Content 오류를 방지합니다.

3. **보안**: `.env` 파일은 민감한 정보를 포함하므로 권한을 제한하세요:
   ```bash
   chmod 600 .env
   ```

