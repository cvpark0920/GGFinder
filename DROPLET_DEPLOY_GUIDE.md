# DigitalOcean Droplet 배포 가이드 (GitHub Actions)

이 가이드는 로컬 도커 환경을 DigitalOcean Droplet에 그대로 배포하는 방법을 설명합니다.

## 1. Droplet 사전 설정

Droplet 생성 후 SSH로 접속하여 아래 명령어를 실행하세요.

```bash
# 1. 패키지 업데이트
apt update && apt upgrade -y

# 2. Docker 및 Docker Compose 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-v2 -y

# 3. 배포 디렉토리 권한 설정 (필요시)
mkdir -p /app/ggfinder
chmod 755 /app/ggfinder
```

## 2. GitHub Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 Secret들을 추가해야 합니다.

| 이름 | 설명 | 예시 |
| :--- | :--- | :--- |
| `DROPLET_IP` | Droplet의 공인 IP | `123.456.78.90` |
| `SSH_USERNAME` | SSH 접속 계정 | `root` |
| `SSH_PRIVATE_KEY` | SSH 개인키 내용 (`~/.ssh/id_rsa`) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `JWT_SECRET` | JWT 서명용 비밀키 | `your_long_random_string` |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 | `GOCSPX-xxxx` |
| `POSTGRES_PASSWORD` | DB 비밀번호 (생략 시 기본값 사용) | `your_db_password` |

## 3. 배포 프로세스

1. `main` 브랜치에 코드를 `push` 합니다.
2. GitHub Actions가 자동으로 실행되어 Droplet에 접속합니다.
3. 최신 코드를 가져오고 `.env` 파일을 생성한 뒤 `docker compose up -d --build`를 실행합니다.
4. 배포가 완료되면 `http://<DROPLET_IP>:4000`에서 앱을 확인할 수 있습니다.

## 4. 로그 확인 및 관리

배포 후 서버에서 로그를 확인하려면 Droplet에 접속하여 아래 명령어를 사용하세요.

```bash
cd /app/ggfinder

# 전체 로그 확인
docker compose logs -f

# 앱 로그만 확인
docker compose logs -f app

# DB 로그만 확인
docker compose logs -f db
```

## 5. 주의사항

*   **GitHub 인증**: 만약 저장소가 **Private(비공개)**라면, Droplet에서 GitHub에 접근할 수 있도록 SSH Key를 등록하거나 PAT(Personal Access Token) 설정을 해야 합니다.
*   **포트**: 기본적으로 4000 포트를 사용합니다. Droplet의 방화벽(UFW 또는 DigitalOcean Cloud Firewall)에서 **4000번 포트가 허용**되어 있어야 합니다.
*   **보안**: SSH 개인키는 절대 외부에 노출되지 않도록 GitHub Secrets로만 관리하세요.
*   **데이터 백업**: Docker 볼륨을 통해 `/var/lib/postgresql/data`와 `/app/uploads`에 데이터가 저장됩니다. 주기적인 백업을 권장합니다.

