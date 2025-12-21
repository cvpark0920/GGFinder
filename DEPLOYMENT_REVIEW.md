# CI/CD 배포 환경 검토 보고서

## 📋 검토 일자
2025년 1월

## ✅ 잘 구성된 부분

### 1. Docker 멀티 스테이지 빌드
- 빌드 스테이지와 프로덕션 스테이지 분리로 이미지 크기 최적화
- Prisma 클라이언트 생성이 적절히 구성됨

### 2. CI 파이프라인
- 린트 및 빌드 테스트 자동화
- Docker 빌드 테스트로 배포 전 검증

### 3. 헬스체크
- `/health` 엔드포인트 구현
- Docker Compose 헬스체크 설정
- 데이터베이스 연결 상태 확인

### 4. 의존성 관리
- `depends_on`과 `condition: service_healthy`로 DB 준비 대기

## ⚠️ 개선된 사항

### 1. 보안 강화
- ✅ `.env` 파일 권한 설정 (`chmod 600`)
- ✅ GitHub 호스트 키 검증 강화
- ✅ Secrets 검증 단계 추가
- ⚠️ **추가 권장**: GitHub Deploy Key 사용 (SSH 키 대신)

### 2. 배포 프로세스 개선
- ✅ 배포 전 백업 생성
- ✅ 롤백 스크립트 제공 (`scripts/rollback-deployment.sh`)
- ✅ 헬스체크 검증 추가
- ✅ 배포 검증 단계 추가
- ✅ 타임아웃 설정 (15분)

### 3. 에러 핸들링
- ✅ `set -euo pipefail`로 엄격한 에러 처리
- ✅ 빌드 실패 시 자동 롤백 시도
- ✅ 상세한 에러 로그 출력

### 4. 리소스 관리
- ✅ 오래된 Docker 이미지 자동 정리 (7일 이상)
- ✅ 백업 파일 관리 (최근 5개만 유지)

### 5. 모니터링
- ✅ 배포 후 헬스체크 검증
- ✅ GitHub Actions Summary에 배포 상태 표시
- ✅ 컨테이너 상태 로그 출력

## 🔧 추가 권장 사항

### 1. GitHub Deploy Key 설정 (보안)
현재는 SSH 개인키를 사용하고 있지만, GitHub Deploy Key를 사용하는 것이 더 안전합니다:

```bash
# Droplet에서 실행
ssh-keygen -t ed25519 -C "deploy-key" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub
```

GitHub 저장소 > Settings > Deploy keys에서 공개키를 추가하고,
워크플로우에서 `SSH_PRIVATE_KEY` 대신 Deploy Key를 사용하세요.

### 2. 환경 변수 관리 개선
현재 `.env` 파일을 직접 생성하고 있습니다. 다음 방법을 고려하세요:

**옵션 1: Docker Secrets 사용**
```yaml
# docker-compose.yml에 추가
secrets:
  jwt_secret:
    external: true
```

**옵션 2: 환경 변수만 사용 (권장)**
`.env` 파일 대신 환경 변수만 사용하고, GitHub Secrets에서 직접 전달:

```yaml
environment:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  # ...
```

### 3. 배포 알림 추가
배포 성공/실패 시 Slack, Discord, 또는 이메일 알림을 추가하세요:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4. 데이터베이스 백업 자동화
현재는 애플리케이션 파일만 백업합니다. 데이터베이스도 백업하세요:

```bash
# 배포 전 DB 백업
docker compose exec -T db pg_dump -U app ggfinder > ${BACKUP_DIR}/${TIMESTAMP}/db_backup.sql
```

### 5. 블루-그린 배포 전략
다운타임을 최소화하기 위해 블루-그린 배포를 고려하세요:

```yaml
services:
  app-blue:
    # ...
  app-green:
    # ...
```

### 6. 모니터링 도구 통합
- **Prometheus + Grafana**: 메트릭 수집 및 시각화
- **Sentry**: 에러 추적
- **Uptime Robot**: 외부 헬스체크

### 7. CI/CD 파이프라인 최적화
- Docker 이미지를 GitHub Container Registry에 푸시
- Droplet에서는 이미지만 pull하여 사용 (빌드 시간 단축)

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: ghcr.io/${{ github.repository }}:latest
```

## 📊 배포 체크리스트

배포 전 확인사항:

- [ ] 모든 GitHub Secrets 설정 완료
- [ ] Droplet에 Docker 및 Docker Compose 설치 완료
- [ ] SSH 키 또는 Deploy Key 설정 완료
- [ ] 방화벽에서 4000번 포트 허용 확인
- [ ] 데이터베이스 백업 완료 (선택사항)
- [ ] 롤백 스크립트 테스트 완료

## 🚨 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. Droplet에 SSH 접속하여 로그 확인:
   ```bash
   cd /app/ggfinder
   docker compose logs -f
   ```
3. 롤백 실행:
   ```bash
   ./scripts/rollback-deployment.sh
   ```

### 헬스체크 실패 시
1. 컨테이너 상태 확인:
   ```bash
   docker compose ps
   ```
2. 애플리케이션 로그 확인:
   ```bash
   docker compose logs app
   ```
3. 데이터베이스 연결 확인:
   ```bash
   docker compose exec db psql -U app -d ggfinder -c "SELECT 1;"
   ```

## 📝 변경 이력

- 2025-01: 초기 검토 및 개선사항 적용
  - 배포 프로세스 개선
  - 롤백 스크립트 추가
  - 보안 강화
  - 헬스체크 검증 추가

