# AWS 인프라 구축 가이드 (Manual Setup)

본 문서는 `missionary-server`의 개발 환경(dev)을 AWS EC2와 RDS를 사용하여 수동으로 구축하는 절차를 안내합니다.

---

## 1. EC2 인스턴스 생성

애플리케이션 서버를 위한 EC2 인스턴스를 생성합니다.

- **AMI**: Amazon Linux 2023 AMI
- **인스턴스 유형**: `t3.micro` (Free Tier 가능)
- **키 페어**: 새 키 페어 생성 또는 기존 키 페어 선택 (.pem 파일 안전하게 보관)
- **네트워크 설정 (보안 그룹)**:
  - SSH (TCP 22): `0.0.0.0/0` (내 IP로 제한 권장)
  - HTTP (TCP 3100): `0.0.0.0/0` (NestJS 서버 포트)
- **스토리지**: 8GB 이상 (기본값 유지)
- **탄력적 IP (Elastic IP)**:
  - [EC2 콘솔] -> [탄력적 IP] -> [탄력적 IP 주소 할당]
  - 할당된 IP를 생성한 EC2 인스턴스에 연결 (인스턴스 중지 후 재시작 시에도 IP 유지 목적)

---

## 2. EC2 초기 설정

SSH를 통해 EC2에 접속하여 필요한 소프트웨어를 설치하고 설정을 수행합니다.

### 2.1. 시스템 업데이트 및 필수 패키지 설치

```bash
sudo dnf update -y
sudo dnf install -y git
```

### 2.2. Docker 및 Docker Compose 설치

```bash
# Docker 설치
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose 설치 (v2)
sudo dnf install -y docker-compose-plugin

# 로그아웃 후 다시 접속하여 docker 명령어 권한 확인
exit
```

### 2.3. Swap 메모리 설정 (2GB)

`t3.micro`는 메모리가 1GB이므로 빌드 시 메모리 부족을 방지하기 위해 2GB의 스왑 파일을 설정합니다.

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
free -h # 설정 확인
```

### 2.4. 프로젝트 초기 clone 절차

```bash
# SSH 키 생성 (GitHub 등록용) 또는 PAT 사용
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub # 출력된 키를 GitHub Deploy Keys에 등록

# 프로젝트 복제
git clone git@github.com:SamilHero/missionary.git /home/ec2-user/missionary
cd /home/ec2-user/missionary

# dev 브랜치 체크아웃
git checkout dev

# 권한 설정
sudo chown -R ec2-user:ec2-user /home/ec2-user/missionary
```

---

## 3. RDS PostgreSQL 생성

데이터베이스를 위한 RDS 인스턴스를 생성합니다.

- **엔진 타입**: PostgreSQL
- **엔진 버전**: PostgreSQL 16.x
- **템플릿**: 프리 티어 (Free Tier)
- **DB 인스턴스 식별자**: `missionary-db-dev`
- **인스턴스 구성**: `db.t3.micro`
- **스토리지**: 20GB gp2
- **연결**:
  - **퍼블릭 액세스**: No
  - **VPC 보안 그룹**: EC2 인스턴스의 보안 그룹으로부터의 `5432` 포트 접속만 허용하도록 설정
- **데이터베이스 옵션**:
  - **초기 데이터베이스 이름**: `missionary_db_dev`

---

## 4. GitHub Secrets 설정

GitHub Actions를 통한 자동 배포를 위해 다음 Secrets를 레포지토리에 등록합니다.

| 이름                       | 설명                                  | 예시                                                                           |
| :------------------------- | :------------------------------------ | :----------------------------------------------------------------------------- |
| `EC2_HOST`                 | EC2 탄력적 IP 주소                    | `13.125.xxx.xxx`                                                               |
| `EC2_SSH_KEY`              | EC2 접속용 .pem 키 내용               | `-----BEGIN RSA PRIVATE KEY-----...`                                           |
| `EC2_USERNAME`             | EC2 접속 계정                         | `ec2-user`                                                                     |
| `DEV_DATABASE_URL`         | RDS 연결 문자열                       | `postgresql://user:password@rds-endpoint:5432/missionary_db_dev?schema=public` |
| `DEV_JWT_SECRET`           | JWT 서명용 비밀키                     | `your-secret-key`                                                              |
| `DEV_JWT_REFRESH_SECRET`   | JWT Refresh 토큰 비밀키               | `your-refresh-secret`                                                          |
| `DEV_GOOGLE_CLIENT_ID`     | Google OAuth 클라이언트 ID            | `...apps.googleusercontent.com`                                                |
| `DEV_GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 보안 비밀번호 | `...`                                                                          |
| `DEV_KAKAO_CLIENT_ID`      | Kakao OAuth 클라이언트 ID             | `...`                                                                          |
| `DEV_KAKAO_CLIENT_SECRET`  | Kakao OAuth 클라이언트 보안 비밀번호  | `...`                                                                          |
| `DEV_AES_ENCRYPT_KEY`      | 데이터 암호화용 32바이트 키           | `...`                                                                          |
| `DEV_COOKIE_SECURE`        | 쿠키 Secure 옵션 (HTTPS 사용 시 true) | `false`                                                                        |

---

## 5. EC2에 .env.dev 파일 생성

서버 구동에 필요한 환경 변수 파일을 EC2 내 프로젝트 경로에 직접 생성합니다.

```bash
cd /home/ec2-user/missionary/packages/server/missionary-server
vi .env.dev
```

내용 작성 (GitHub Secrets와 동일한 값 입력):

```env
DATABASE_URL="postgresql://user:password@rds-endpoint:5432/missionary_db_dev?schema=public"
NODE_ENV="development"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://[EC2-IP]:3100/auth/google/callback"
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
KAKAO_CALLBACK_URL="http://[EC2-IP]:3100/auth/kakao/callback"
ADMIN_CLIENT_URL="http://[EC2-IP]:3000"
AES_ENCRYPT_KEY="..."
COOKIE_SECURE=false
```

---

## 6. Prisma 초기 마이그레이션

최초 배포 시 또는 스키마 변경 시 EC2에서 수동으로 마이그레이션을 실행합니다.

```bash
# EC2 접속 후 프로젝트 경로로 이동
cd /home/ec2-user/missionary

# Docker를 통해 서버를 임시로 실행하거나 로컬 pnpm을 사용하여 마이그레이션 수행
# 여기서는 Docker 배포 전 RDS 연결 확인 및 테이블 생성을 위해 직접 실행 권장

# 방법: Docker 컨테이너 내부에서 실행 (배포 완료 후)
docker exec missionary-server-container-id npx prisma migrate deploy
```

> **참고**: CI/CD 파이프라인이 설정되어 있다면, `pnpm build:server` 단계 이후에 자동화할 수 있으나 최초 1회는 수동 실행이 안전합니다.

---

## 관련 문서

- [AWS 프리 티어 안내](https://aws.amazon.com/free/)
- [Amazon Linux 2023 Docker 설치 가이드](https://docs.aws.amazon.com/linux/al2023/ug/docker-install.html)
- [Prisma Migrate Deploy 가이드](https://www.prisma.io/docs/orm/prisma-migrate/deployment/deploying-migrations-to-production)
