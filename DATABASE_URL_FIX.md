# DATABASE_URL 오류 해결 가이드

## 문제 상황

DigitalOcean 배포 시 `DATABASE_URL` 환경 변수가 설정되지 않아 Prisma가 데이터베이스에 연결할 수 없습니다.

## 해결 방법

### 방법 1: DigitalOcean 콘솔에서 데이터베이스 연결 확인 (권장)

1. **DigitalOcean 콘솔 접속**
   - [DigitalOcean Apps](https://cloud.digitalocean.com/apps)로 이동
   - 생성한 앱 클릭

2. **데이터베이스 연결 확인**
   - 앱 상세 페이지에서 "Components" 또는 "Resources" 탭 확인
   - 데이터베이스가 "Connected" 상태인지 확인
   - 데이터베이스가 없으면 추가 필요

3. **데이터베이스 추가 (없는 경우)**
   - 앱 상세 페이지 > "Components" 탭
   - "Add Component" > "Database" 선택
   - PostgreSQL 16 선택
   - 데이터베이스 이름: `ggfinder`
   - 사용자 이름: `app`
   - "Add Database" 클릭

4. **환경 변수 확인**
   - Settings > App-Level Environment Variables로 이동
   - `DATABASE_URL` 변수가 있는지 확인
   - 값이 `${db.DATABASE_URL}` 또는 실제 연결 문자열인지 확인

5. **앱 재배포**
   - 데이터베이스 연결 후 앱을 재배포해야 함
   - "Actions" > "Create Deployment" 클릭
   - 또는 GitHub에 푸시하여 자동 배포

### 방법 2: app.yaml을 사용한 앱 재생성

`app.yaml` 파일을 사용하여 앱을 재생성하면 데이터베이스가 자동으로 연결됩니다.

```bash
# doctl CLI 사용
doctl apps create --spec app.yaml
```

또는 DigitalOcean 콘솔에서:
1. 기존 앱 삭제 (또는 새 앱 생성)
2. "Create App" > "From YAML" 선택
3. `app.yaml` 파일 내용 붙여넣기
4. "Create Resources" 클릭

### 방법 3: 수동으로 DATABASE_URL 설정 (임시 해결책)

데이터베이스가 연결되어 있지만 환경 변수가 설정되지 않은 경우:

1. **데이터베이스 연결 문자열 확인**
   - DigitalOcean 콘솔 > Databases > 데이터베이스 선택
   - "Connection Details"에서 연결 문자열 확인
   - 또는 "Connection String" 탭에서 확인

2. **환경 변수 수동 추가**
   - 앱 > Settings > App-Level Environment Variables
   - "Add Variable" 클릭
   - Key: `DATABASE_URL`
   - Value: 데이터베이스 연결 문자열
   - Type: `SECRET` (권장)
   - Scope: `RUN_TIME`
   - "Save" 클릭

3. **연결 문자열 형식**
   ```
   postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
   ```
   
   예시:
   ```
   postgresql://app:your_password@db-postgresql-sgp1-12345-do-user-123456-0.db.ondigitalocean.com:25060/ggfinder?sslmode=require
   ```

## 확인 방법

### 1. 환경 변수 확인

```bash
# doctl CLI 사용
doctl apps get <APP_ID> --format Spec.Services[0].Envs
```

### 2. 배포 로그 확인

```bash
# 런타임 로그 확인
doctl apps logs <APP_ID> --type run | grep DATABASE_URL

# 빌드 로그 확인
doctl apps logs <APP_ID> --type build
```

### 3. 앱 내부에서 확인

배포 후 로그에서 다음 메시지 확인:
- ✅ `DATABASE_URL: SET` (정상)
- ❌ `DATABASE_URL: NOT SET` (문제)

## 예상 결과

문제가 해결되면 로그에 다음과 같이 표시됩니다:

```
[DEBUG] DATABASE_URL check: SET
[DEBUG] Creating PrismaClient
[DEBUG] PrismaClient created successfully
✅ Server is running on port 4000
📊 DATABASE_URL: SET
```

## 추가 확인 사항

### app.yaml 설정 확인

`app.yaml` 파일에 다음이 포함되어 있는지 확인:

```yaml
databases:
  - name: db
    engine: PG
    production: true
    version: "16"
    db_name: ggfinder
    db_user: app

services:
  - name: app
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
```

### 데이터베이스 상태 확인

DigitalOcean 콘솔에서:
- 데이터베이스가 "Running" 상태인지 확인
- 데이터베이스가 앱과 같은 리전에 있는지 확인
- 데이터베이스 연결 풀이 활성화되어 있는지 확인

## 트러블슈팅

### 문제: 데이터베이스가 연결되어 있지만 DATABASE_URL이 설정되지 않음

**해결책**: 
- 앱을 재배포해보세요
- 또는 수동으로 DATABASE_URL 환경 변수를 추가하세요

### 문제: app.yaml을 사용했지만 데이터베이스가 생성되지 않음

**해결책**:
- `app.yaml`의 `databases` 섹션이 올바른지 확인
- 앱 생성 시 데이터베이스가 자동으로 생성되는지 확인
- 수동으로 데이터베이스를 추가한 후 연결

### 문제: DATABASE_URL은 설정되었지만 연결 실패

**해결책**:
- 연결 문자열 형식 확인
- 데이터베이스 방화벽 규칙 확인
- SSL 모드 확인 (`sslmode=require`)

