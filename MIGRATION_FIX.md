# 데이터베이스 마이그레이션 수동 실행 가이드

배포 환경에서 `avatarUrl` 컬럼이 없는 경우, 마이그레이션을 수동으로 실행해야 합니다.

## 🔍 문제 확인

에러 메시지:
```
The column `avatarUrl` does not exist in the current database.
```

## ✅ 해결 방법

### 방법 1: DigitalOcean 콘솔에서 수동 실행 (권장)

1. **DigitalOcean 콘솔 접속**
   - [DigitalOcean Apps 페이지](https://cloud.digitalocean.com/apps)로 이동
   - 앱 선택

2. **컨테이너에 접속**
   - **"Settings"** 탭 클릭
   - **"Run Command"** 또는 **"Console"** 옵션 찾기
   - 또는 **"Deployments"** 탭에서 최신 배포의 로그 확인

3. **마이그레이션 실행**
   ```bash
   npx prisma@6.1.0 migrate deploy
   ```

### 방법 2: doctl CLI 사용

```bash
# App ID 확인
doctl apps list

# 앱의 실행 중인 컨테이너에 접속하여 마이그레이션 실행
# (DigitalOcean App Platform은 직접 컨테이너 접속을 지원하지 않으므로,
#  대신 배포 시 마이그레이션이 실행되도록 확인)
```

### 방법 3: SQL 직접 실행

DigitalOcean Managed Database를 사용하는 경우:

1. **데이터베이스 콘솔 접속**
   - DigitalOcean 콘솔 > Databases > 데이터베이스 선택
   - **"Users & Databases"** 탭에서 연결 정보 확인

2. **SQL 실행**
   ```sql
   ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
   ```

### 방법 4: 재배포로 마이그레이션 실행

Dockerfile이 수정되어 마이그레이션이 자동으로 실행되도록 되어 있습니다:

```dockerfile
CMD ["sh", "-c", "npx prisma@6.1.0 migrate deploy && node server/dist/index.js"]
```

재배포하면 마이그레이션이 자동으로 실행됩니다:

```bash
# GitHub에 푸시하면 자동 배포
git push origin main

# 또는 GitHub Actions에서 수동 실행
```

## 🔍 마이그레이션 상태 확인

### Prisma 마이그레이션 상태 확인

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 히스토리 확인
npx prisma migrate list
```

### 데이터베이스 스키마 확인

```sql
-- PostgreSQL에서 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'avatarUrl';
```

## 📝 마이그레이션 파일 확인

마이그레이션 파일 위치: `prisma/migrations/20251216090000_add_avatar_url/migration.sql`

내용:
```sql
-- AlterTable
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
```

`IF NOT EXISTS`를 사용하고 있어서 안전하게 실행할 수 있습니다.

## 🚨 문제 해결

### 마이그레이션이 실행되지 않는 경우

1. **환경 변수 확인**
   - `DATABASE_URL`이 올바르게 설정되어 있는지 확인
   - DigitalOcean 콘솔 > Apps > Settings > Environment Variables

2. **마이그레이션 파일 확인**
   - `prisma/migrations/` 폴더에 마이그레이션 파일이 있는지 확인
   - 마이그레이션 파일이 Docker 이미지에 포함되어 있는지 확인

3. **권한 확인**
   - 데이터베이스 사용자가 테이블을 수정할 권한이 있는지 확인

### 마이그레이션이 실패하는 경우

1. **로그 확인**
   ```bash
   doctl apps logs <APP_ID> --type run | grep -i migration
   ```

2. **수동 실행**
   - 위의 방법 3 (SQL 직접 실행) 사용

3. **마이그레이션 롤백**
   ```bash
   # 마이그레이션 롤백 (주의: 데이터 손실 가능)
   npx prisma migrate resolve --rolled-back 20251216090000_add_avatar_url
   ```

## 📚 추가 리소스

- [Prisma Migrate 문서](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [DigitalOcean App Platform 문서](https://docs.digitalocean.com/products/app-platform/)

