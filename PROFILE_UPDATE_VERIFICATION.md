# 프로필 정보 저장 확인 가이드

## ✅ 현재 구현 상태

실명(realName)과 전화번호(phone) 저장 기능은 이미 구현되어 있습니다:

1. **프론트엔드**: `CompleteRegistration.tsx`
   - 사용자가 실명과 전화번호 입력
   - `PATCH /api/users/:id` 엔드포인트 호출
   - `realName`과 `phone` 전송

2. **백엔드**: `server/routes/users.ts`
   - `PATCH /api/users/:id` 엔드포인트
   - `realName`과 `phone` 처리
   - 데이터베이스에 저장

## 🔍 확인 방법

### 1. 브라우저에서 테스트

1. Google 로그인
2. 추가 정보 입력 페이지에서 실명과 전화번호 입력
3. "완료" 버튼 클릭
4. 데이터베이스에서 확인

### 2. 데이터베이스에서 확인

```sql
-- 사용자 정보 확인
SELECT id, username, email, "realName", phone, role, status 
FROM users 
WHERE email = 'cvpark0920@gmail.com';
```

### 3. 서버 로그 확인

```bash
docker-compose logs app --tail=50 | grep -E "PATCH|users|realName|phone"
```

## 📝 코드 흐름

1. 사용자가 `CompleteRegistration.tsx`에서 실명과 전화번호 입력
2. `handleSubmit` 함수에서 `PATCH /api/users/${user?.id}` 호출
3. `server/routes/users.ts`의 `PATCH /:id` 엔드포인트에서 처리
4. `realName`과 `phone`을 데이터베이스에 저장
5. 업데이트된 사용자 정보 반환
6. `AuthContext` 업데이트

## ⚠️ 문제 해결

### 저장이 안 되는 경우

1. **서버 로그 확인**
   ```bash
   docker-compose logs app --tail=100
   ```

2. **인증 토큰 확인**
   - `idToken`이 제대로 전달되는지 확인
   - `Authorization` 헤더 확인

3. **권한 확인**
   - 본인 정보 업데이트인지 확인
   - 관리자 권한이 필요한지 확인

4. **데이터베이스 연결 확인**
   - 데이터베이스가 정상 작동하는지 확인
   - Prisma 마이그레이션 확인

