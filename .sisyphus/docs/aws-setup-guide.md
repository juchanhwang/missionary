# AWS 인프라 셋업 가이드 (Dev 환경)

## 1. EC2 인스턴스 생성

- AMI: Amazon Linux 2023
- 인스턴스 타입: t3.micro (Free Tier)
- 보안 그룹:
  - SSH (22): My IP only
  - Custom TCP (3100): 0.0.0.0/0
- 키 페어 생성 후 .pem 파일 안전 보관
- Elastic IP 할당 (실행 중 인스턴스에 무료)

## 2. EC2 초기 설정

### Docker & Docker Compose 설치

```bash
# 시스템 업데이트
sudo dnf update -y

# Git, Docker 설치
sudo dnf install -y docker git

# Docker 실행 및 권한 설정
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose 플러그인 확인 (Amazon Linux 2023은 기본 포함될 수 있음)
# 없으면 설치: sudo dnf install -y docker-compose-plugin

# 권한 적용을 위해 로그아웃 후 재접속
exit
# (재접속)
```

### 2GB Swap 설정

```bash
# 2GB 파일 생성
sudo dd if=/dev/zero of=/swapfile bs=128M count=16

# 권한 설정
sudo chmod 600 /swapfile

# Swap 영역 설정
sudo mkswap /swapfile

# Swap 활성화
sudo swapon /swapfile

# 재부팅 후에도 유지되도록 fstab 등록
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# 확인
free -h
```

### 프로젝트 클론

```bash
git clone https://github.com/SamilHero/missionary.git
cd missionary
```

## 3. RDS PostgreSQL 생성

- 엔진: PostgreSQL 16
- 인스턴스 클래스: db.t3.micro (Free Tier)
- 스토리지: 20GB gp2
- 보안 그룹: EC2 보안 그룹에서만 5432 인바운드
- DB 이름: missionary_db_dev
- 마스터 유저: postgres
- 퍼블릭 액세스: No

## 4. GitHub Secrets 설정

GitHub Repository > Settings > Secrets and variables > Actions > New repository secret

| Name         | Description       |
| ------------ | ----------------- |
| EC2_HOST     | EC2 Elastic IP    |
| EC2_SSH_KEY  | .pem file content |
| EC2_USERNAME | ec2-user          |

## 5. EC2에 .env.dev 파일 생성

EC2 서버에서 직접 파일을 생성합니다.

```bash
cd packages/server/missionary-server
cp .env.dev.example .env.dev
vi .env.dev
```

`.env.dev` 파일에서 다음 값을 수정합니다:

- `DATABASE_URL`: RDS 엔드포인트, 유저명, 비밀번호 반영
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: 강력한 난수 문자열로 변경
- `AES_ENCRYPT_KEY`: `openssl rand -hex 32` 명령어로 생성한 64글자 hex 값

## 6. 초기 마이그레이션 및 첫 배포

```bash
# Docker Compose 빌드 및 실행
docker compose -f docker-compose.prod.yml up -d --build

# 컨테이너 상태 확인
docker compose -f docker-compose.prod.yml ps

# 로그 확인
docker compose -f docker-compose.prod.yml logs -f

# Health Check
curl -f http://localhost:3100/health

# DB 마이그레이션 (컨테이너 내부에서 실행)
docker exec -it missionary-server-dev npx prisma migrate deploy
```

## 트러블슈팅

- **메모리 부족**: `free -h`로 swap이 잡혀있는지 확인하세요. Node.js 빌드 시 메모리가 많이 필요합니다.
- **Docker 빌드 실패**: bcrypt 등 네이티브 모듈 컴파일 문제일 수 있습니다. Dockerfile이 멀티스테이지 빌드를 잘 따르고 있는지 확인하세요.
- **DB 연결 실패**: RDS 보안 그룹의 인바운드 규칙에 EC2 보안 그룹 ID가 추가되어 있는지 확인하세요. (IP로 넣으면 IP 변경 시 끊김)
