# 슈퍼관리자 생성 가이드

## 📋 개요

`cvpark0920@gmail.com` 계정을 슈퍼관리자로 등록하는 스크립트입니다.

## 🚀 실행 방법

### 방법 1: npm 스크립트 사용 (권장)

```bash
npm run create-super-admin
```

### 방법 2: 직접 실행

```bash
npx tsx server/scripts/create-super-admin.ts
```

### 방법 3: Docker 컨테이너 내에서 실행

```bash
# 실행 중인 컨테이너에서 실행
docker-compose exec app npm run create-super-admin

# 또는 직접 실행
docker-compose exec app npx tsx server/scripts/create-super-admin.ts
```

## 🔍 동작 방식

1. **기존 사용자 확인**
   - `cvpark0920@gmail.com`으로 사용자 검색
   - 존재하면 업데이트, 없으면 생성

2. **슈퍼관리자 설정**
   - `role`: `super_admin`
   - `status`: `active`
   - `agencyId`: `null` (소속사 없음)

3. **결과 출력**
   - 사용자 정보 출력
   - 성공/실패 메시지 표시

## ✅ 확인 방법

스크립트 실행 후:

```bash
# 데이터베이스에서 확인
npx prisma studio
# 또는
psql $DATABASE_URL -c "SELECT id, username, email, role, status FROM users WHERE email = 'cvpark0920@gmail.com';"
```

## 📝 주의사항

- 이 스크립트는 기존 사용자가 있으면 업데이트합니다
- 슈퍼관리자는 소속사(`agencyId`)가 없습니다
- 상태(`status`)는 자동으로 `active`로 설정됩니다

