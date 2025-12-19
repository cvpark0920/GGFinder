# 실패한 마이그레이션 해결 가이드

## 🔍 문제

마이그레이션 `20251215234033_add_father_mother_age`가 이전에 실패하여 새로운 마이그레이션이 적용되지 않고 있습니다.

에러 메시지:
```
A Prisma migration failed, causing the application to exit. 
The migration '20251215234033_add_father_mother_age' previously failed, 
preventing new migrations from being applied.
```

## ✅ 해결 방법

### 방법 1: 실패한 마이그레이션을 해결된 것으로 표시 (권장)

Prisma는 실패한 마이그레이션이 있으면 새로운 마이그레이션을 적용하지 않습니다. 
실패한 마이그레이션을 해결된 것으로 표시해야 합니다.

#### DigitalOcean App Platform에서 실행

1. **배포 시 마이그레이션 해결 스크립트 추가**

   `Dockerfile`의 CMD를 수정하여 실패한 마이그레이션을 자동으로 해결:

   ```dockerfile
   CMD ["sh", "-c", "npx prisma@6.1.0 migrate resolve --applied 20251215234033_add_father_mother_age || true; npx prisma@6.1.0 migrate deploy && node server/dist/index.js"]
   ```

2. **또는 수동으로 해결**

   DigitalOcean 콘솔에서 앱의 실행 명령어를 수정하거나,
   데이터베이스에 직접 접속하여 마이그레이션 상태를 확인하고 수정합니다.

### 방법 2: 데이터베이스에서 직접 해결

#### Prisma 마이그레이션 테이블 확인

```sql
-- 마이그레이션 상태 확인
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 10;
```

#### 실패한 마이그레이션 확인

```sql
-- 실패한 마이그레이션 찾기
SELECT * FROM "_prisma_migrations" 
WHERE migration_name = '20251215234033_add_father_mother_age';
```

#### 해결 방법 A: 마이그레이션을 적용된 것으로 표시

마이그레이션이 실제로 적용되었는지 확인한 후:

```sql
-- 마이그레이션을 적용된 것으로 표시
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    applied_steps_count = 1,
    logs = NULL
WHERE migration_name = '20251215234033_add_father_mother_age' 
  AND finished_at IS NULL;
```

#### 해결 방법 B: 마이그레이션을 롤백된 것으로 표시

마이그레이션이 적용되지 않았다면:

```sql
-- 마이그레이션을 롤백된 것으로 표시
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    applied_steps_count = 0,
    logs = NULL
WHERE migration_name = '20251215234033_add_father_mother_age' 
  AND finished_at IS NULL;
```

### 방법 3: Dockerfile 수정으로 자동 해결

`Dockerfile`의 CMD를 수정하여 실패한 마이그레이션을 자동으로 해결:

```dockerfile
CMD ["sh", "-c", "npx prisma@6.1.0 migrate resolve --applied 20251215234033_add_father_mother_age 2>/dev/null || true; npx prisma@6.1.0 migrate deploy && echo '✅ Migrations completed' && node server/dist/index.js"]
```

이렇게 하면:
1. 실패한 마이그레이션을 해결된 것으로 표시 시도 (실패해도 계속 진행)
2. 모든 마이그레이션 적용
3. 서버 시작

## 🔍 마이그레이션 파일 확인

### 실패한 마이그레이션 내용

파일: `prisma/migrations/20251215234033_add_father_mother_age/migration.sql`

이 마이그레이션이 실제로 필요한 변경사항을 포함하고 있는지 확인하고,
이미 적용되었는지 확인해야 합니다.

### 중복 마이그레이션 확인

`20251215180000_add_father_mother_age`와 `20251215234033_add_father_mother_age`가 
같은 작업을 수행하는지 확인합니다. 중복이면 하나를 제거해야 할 수 있습니다.

## 📝 단계별 해결 절차

### 1단계: 데이터베이스 상태 확인

```sql
-- fatherAge, motherAge 컬럼이 있는지 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN ('fatherAge', 'motherAge');
```

### 2단계: 마이그레이션 상태 확인

```sql
-- 마이그레이션 히스토리 확인
SELECT migration_name, finished_at, applied_steps_count, logs
FROM "_prisma_migrations"
WHERE migration_name LIKE '%father%mother%'
ORDER BY started_at;
```

### 3단계: 해결 방법 선택

- **컬럼이 이미 있는 경우**: 마이그레이션을 적용된 것으로 표시
- **컬럼이 없는 경우**: 마이그레이션을 롤백된 것으로 표시하고, 필요한 경우 수동으로 적용

### 4단계: 마이그레이션 상태 수정

위의 SQL 명령어를 사용하여 마이그레이션 상태를 수정합니다.

### 5단계: 새로운 마이그레이션 적용

```bash
npx prisma migrate deploy
```

## 🚨 주의사항

1. **데이터 백업**: 마이그레이션 상태를 수정하기 전에 데이터베이스를 백업하세요.

2. **프로덕션 환경**: 프로덕션 환경에서는 신중하게 진행하세요.

3. **마이그레이션 순서**: 마이그레이션은 순서대로 적용되어야 합니다.

## 📚 추가 리소스

- [Prisma Migrate 문서](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Migrate Troubleshooting](https://www.prisma.io/docs/guides/migrate/troubleshooting-development)

