# Backend CI/CD & AWS Deployment (Dev Environment)

## TL;DR

> **Quick Summary**: NestJS 백엔드 서버를 Docker화하고, AWS EC2 (Free Tier)에 dev 환경을 배포하며, GitHub Actions CI/CD 파이프라인을 구축한다.
>
> **Deliverables**:
>
> - NestJS 서버용 멀티스테이지 Dockerfile
> - EC2 배포용 docker-compose.prod.yml (NestJS + Redis)
> - GitHub Actions 배포 워크플로우 (dev 브랜치 push → 자동 배포)
> - 기존 CI 워크플로우에 서버 빌드/테스트 추가
> - AWS 인프라 셋업 가이드 (EC2 + RDS)
> - COOKIE_SECURE 환경변수 지원 코드 수정
>
> **Estimated Effort**: Medium (3-5일)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (Dockerfile) → Task 3 (docker-compose) → Task 5 (AWS 셋업 가이드) → Task 6 (GitHub Actions Deploy) → Task 7 (통합 검증)

---

## Context

### Original Request

백엔드 서버의 CI/CD 연결 및 배포. dev/production 두 환경으로 분리. 백엔드 배포를 먼저 진행.

### Interview Summary

**Key Discussions**:

- 클라우드: AWS Free Tier 활용 (기존 계정 보유)
- CI/CD: GitHub Actions (이미 프론트엔드 CI 존재)
- 환경: dev 환경만 우선 구축, production은 실 서비스 시 추가
- DB: RDS Free Tier (db.t3.micro), dev DB 1개
- Redis: EC2 내 Docker 컨테이너 (BullMQ participation-queue용)
- OAuth: 배포 환경에서 비활성화 (도메인 없이 Google/Kakao 콜백 불가)
- 테스트: jest unit test를 CI에 포함
- Prisma 마이그레이션: CI/CD에서 자동 실행

**Research Findings**:

- `bcrypt`가 네이티브 C++ 모듈이라 Docker 멀티스테이지 빌드 필수
- Prisma가 커스텀 output 경로(`./prisma/generated/prisma`) 사용 → Docker COPY 주의
- Prisma schema에 `url` 필드 없음 → `DATABASE_URL` env var로 마이그레이션 실행
- 기존 CI에서 pnpm 버전이 8로 설정됨 (실제는 10.28.1)
- Health check 엔드포인트 `GET /health` 존재
- `auth.controller.ts`에서 `NODE_ENV=production`일 때 cookie `secure: true` 설정 → HTTP에서 인증 깨짐

### Metis Review

**Identified Gaps** (addressed):

- OAuth bare IP 차단: 배포 환경에서 OAuth 비활성화로 해결
- Cookie secure + HTTP: `COOKIE_SECURE` 환경변수 override 추가로 해결
- t2.micro 메모리 부족: dev만 운영하므로 t3.micro + swap으로 충분
- Redis 환경 격리: dev만 운영하므로 격리 불필요
- bcrypt native build: 멀티스테이지 Docker 빌드로 해결
- CI pnpm 버전 불일치: 10.28.1로 수정

---

## Work Objectives

### Core Objective

NestJS 백엔드 서버를 Docker 컨테이너로 패키징하고, AWS EC2 + RDS에 dev 환경을 자동 배포하는 CI/CD 파이프라인을 구축한다.

### Concrete Deliverables

- `packages/server/missionary-server/Dockerfile` — 멀티스테이지 빌드
- `packages/server/missionary-server/docker-compose.prod.yml` — EC2 배포용
- `packages/server/missionary-server/.dockerignore`
- `.github/workflows/deploy-server.yaml` — 배포 워크플로우
- `.github/workflows/ci.yaml` — 서버 빌드/테스트 추가 (기존 파일 수정)
- `packages/server/missionary-server/src/auth/auth.controller.ts` — COOKIE_SECURE 환경변수 지원
- `.sisyphus/docs/aws-setup-guide.md` — AWS 인프라 수동 셋업 가이드

### Definition of Done

- [x] `docker compose -f docker-compose.prod.yml up` 실행 시 서버 + Redis 정상 기동
- [x] `curl http://localhost:3100/health` → `{"status":"ok"}` 응답
- [x] GitHub Actions에서 dev 브랜치 push 시 자동 배포 실행
- [x] RDS에 Prisma 마이그레이션 자동 적용
- [x] CI에서 서버 lint + type-check + test + build 통과

### Must Have

- Docker 멀티스테이지 빌드 (bcrypt 네이티브 모듈 대응)
- Prisma generate + 커스텀 output 경로 처리
- DATABASE_URL을 env var로 설정해 prisma migrate deploy 실행
- GitHub Secrets으로 민감정보 관리
- Docker HEALTHCHECK with GET /health
- COOKIE_SECURE 환경변수 오버라이드 (HTTP에서도 인증 가능)

### Must NOT Have (Guardrails)

- ❌ `prisma migrate dev` in CI — `prisma migrate deploy`만 사용
- ❌ RDS 보안 그룹을 0.0.0.0/0에 노출 — EC2 보안 그룹만 인바운드 허용
- ❌ 시크릿을 git에 커밋 — GitHub Secrets → SSH → .env on EC2
- ❌ 기존 프론트엔드 CI 작업 수정 (build matrix의 design-system/admin/app)
- ❌ S3/파일 업로드 인프라 추가 (서버 코드에 미구현)
- ❌ CloudWatch/모니터링 스택 추가 (out of scope)
- ❌ 로드밸런서/오토스케일링 추가 (단일 EC2 Free Tier)
- ❌ Production 환경 구축 (나중에)
- ❌ `db:seed` 자동 실행 in production (수동 단계)
- ❌ Terraform/CDK IaC (Free Tier 단일 EC2, 수동 콘솔 셋업)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (jest + ts-jest 설정 존재)
- **Automated tests**: Tests-after (기존 4개 테스트 파일 존재, CI에 포함)
- **Framework**: jest (이미 구성됨)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> 모든 task는 Agent-Executed QA 시나리오를 포함합니다.
> Dockerfile/docker-compose 검증은 `docker compose` 명령어로,
> CI 워크플로우 검증은 `gh` CLI로,
> AWS 인프라 검증은 가이드 문서 완성도로 확인합니다.

**Verification Tool by Deliverable Type:**

| Type                | Tool                          | How Agent Verifies                            |
| ------------------- | ----------------------------- | --------------------------------------------- |
| Dockerfile          | Bash (docker build/run)       | Build image, run container, curl health check |
| docker-compose      | Bash (docker compose)         | Compose up, verify all services healthy       |
| GitHub Actions YAML | Bash (yamllint + gh workflow) | YAML syntax check, dry-run validation         |
| 코드 수정           | Bash (nest build + jest)      | Build 성공, 기존 테스트 통과                  |
| AWS 가이드          | Markdown 검증                 | 모든 단계가 구체적 명령어/스크린샷 설명 포함  |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Dockerfile 작성
├── Task 2: COOKIE_SECURE 환경변수 지원 코드 수정
└── Task 4: CI 워크플로우 수정 (서버 빌드/테스트 추가)

Wave 2 (After Wave 1):
├── Task 3: docker-compose.prod.yml 작성 [depends: 1]
├── Task 5: AWS 셋업 가이드 작성 [depends: 1]

Wave 3 (After Wave 2):
├── Task 6: GitHub Actions 배포 워크플로우 [depends: 3, 4, 5]

Wave 4 (After Wave 3):
└── Task 7: 통합 검증 [depends: all]
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 3, 5   | 2, 4                 |
| 2    | None       | 6      | 1, 4                 |
| 3    | 1          | 6, 7   | 5                    |
| 4    | None       | 6      | 1, 2                 |
| 5    | 1          | 6      | 3                    |
| 6    | 3, 4, 5    | 7      | None                 |
| 7    | All        | None   | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents         |
| ---- | ------- | -------------------------- |
| 1    | 1, 2, 4 | 3 parallel agents          |
| 2    | 3, 5    | 2 parallel agents          |
| 3    | 6       | 1 agent                    |
| 4    | 7       | 1 agent (integration test) |

---

## TODOs

- [x] 1. NestJS 서버 Dockerfile 작성 (멀티스테이지)

  **What to do**:
  - `packages/server/missionary-server/Dockerfile` 생성
  - Stage 1 (builder): Node 20 alpine + `python3 make g++` (bcrypt 빌드용)
    - monorepo root에서 `pnpm install --filter missionary-server...`
    - `npx prisma generate` 실행 (커스텀 output: `prisma/generated/prisma`)
    - `nest build` → `dist/` 생성
  - Stage 2 (runner): Node 20 alpine (slim)
    - `dist/`, `node_modules/`, `prisma/generated/`, `prisma/migrations/`, `prisma/schema.prisma`, `prisma.config.ts`, `prisma/seed.ts` 복사
    - **`prisma.config.ts` 필수**: Prisma 7.x 설정 파일 — `dotenv/config` import + `datasource.url: env('DATABASE_URL')` 매핑. `prisma migrate deploy` 실행 시 이 파일이 없으면 마이그레이션 실패
    - `HEALTHCHECK CMD curl -f http://localhost:3100/health || exit 1`
    - `CMD ["node", "dist/main"]`
  - `packages/server/missionary-server/.dockerignore` 생성
    - `node_modules`, `.env`, `dist`, `.git`, `*.md` 등 제외
  - 빌드 컨텍스트 고려: monorepo root에서 빌드해야 pnpm workspace 의존성 해결 가능

  **Must NOT do**:
  - `prisma migrate`를 Dockerfile 안에서 실행하지 않음 (런타임에 별도 실행)
  - devDependencies를 runner 스테이지에 포함하지 않음
  - `.env` 파일을 이미지에 포함하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Docker 멀티스테이지 빌드 + monorepo 컨텍스트 + native 모듈 처리 등 인프라 복합 작업
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: NestJS 빌드 프로세스, Prisma 통합, dist 구조 이해 필요
  - **Skills Evaluated but Omitted**:
    - `api-design`: Dockerfile은 API 설계와 무관
    - `security`: Docker 보안은 이 단계에서 고려할 수준 아님

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4)
  - **Blocks**: Task 3, Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `packages/server/missionary-server/docker-compose.yml` — 기존 Docker Compose 패턴 (PostgreSQL 컨테이너 설정 참고)
  - `packages/server/missionary-server/package.json:11` — `"start:prod": "node dist/main"` 프로덕션 시작 명령
  - `packages/server/missionary-server/package.json:15` — `"prisma:generate": "prisma generate"` 빌드 전 필수 실행

  **API/Type References**:
  - `packages/server/missionary-server/prisma/schema.prisma:1-8` — generator 설정, 특히 `output = "./generated/prisma"` 커스텀 경로 확인 필수
  - `packages/server/missionary-server/prisma.config.ts` — **Prisma 7.x 설정 파일 (CRITICAL)**: `dotenv/config` import → `defineConfig({ datasource: { url: env('DATABASE_URL') } })`. Docker runner stage에 반드시 COPY 필요 — `prisma migrate deploy`와 `prisma generate` 모두 이 파일 참조
  - `packages/server/missionary-server/tsconfig.json` — 빌드 타겟, path alias 설정 확인

  **Documentation References**:
  - `packages/server/CLAUDE.md` — NestJS 서버 패턴, 디렉토리 구조, 빌드/배포 명령어

  **External References**:
  - Prisma Docker 가이드: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/docker

  **WHY Each Reference Matters**:
  - `docker-compose.yml`: PostgreSQL 컨테이너 설정 패턴에서 healthcheck, volume 패턴 참고
  - `schema.prisma`: generator output 경로가 기본값과 다르므로 Docker COPY 시 반드시 이 경로를 포함해야 함
  - `package.json`: 빌드/시작 스크립트 확인 — `nest build` → `node dist/main` 패턴
  - **`prisma.config.ts`**: Prisma 7.x 핵심 설정 파일. datasource URL 매핑, migration path 정의, seed 명령 정의를 모두 포함. Docker runner stage에서 `prisma migrate deploy` 실행 시 이 파일이 없으면 `Error: Cannot find prisma config` 발생. **반드시 builder → runner COPY 대상에 포함**

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Docker 이미지 빌드 성공
    Tool: Bash (docker)
    Preconditions: Docker Desktop 실행 중
    Steps:
      1. cd packages/server/missionary-server
      2. docker build -t missionary-server-test -f Dockerfile ../../../
      3. Assert: exit code 0
      4. docker images missionary-server-test --format "{{.Size}}"
      5. Assert: 이미지 크기 500MB 미만 (slim runner stage)
    Expected Result: 멀티스테이지 빌드 성공, 최종 이미지 경량
    Evidence: 빌드 로그 캡처

  Scenario: 컨테이너 실행 및 헬스체크 (DB 없이)
    Tool: Bash (docker)
    Preconditions: 빌드된 이미지 존재
    Steps:
      1. docker run -d --name test-server -p 3199:3100 \
           -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
           -e JWT_SECRET="test" \
           -e JWT_REFRESH_SECRET="test" \
           -e AES_ENCRYPT_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" \
           -e REDIS_HOST="localhost" \
           missionary-server-test
      2. sleep 3
      3. docker logs test-server 2>&1
      4. Assert: 로그에 "Nest application" 또는 시작 관련 메시지 포함
         (DB 연결 실패로 완전 기동은 안될 수 있지만 이미지 자체는 정상 실행)
      5. docker rm -f test-server
    Expected Result: 컨테이너 시작 시도 확인 (이미지 패키징 정상)
    Evidence: docker logs 출력 캡처

  Scenario: .dockerignore 검증
    Tool: Bash
    Preconditions: .dockerignore 파일 존재
    Steps:
      1. cat packages/server/missionary-server/.dockerignore
      2. Assert: node_modules 포함
      3. Assert: .env 포함
      4. Assert: dist 포함
    Expected Result: 불필요한 파일이 Docker 빌드 컨텍스트에서 제외됨
    Evidence: .dockerignore 내용 출력
  ```

  **Evidence to Capture:**
  - [x] Docker build 로그: `.sisyphus/evidence/task-1-docker-build.log`
  - [x] Docker run 로그: `.sisyphus/evidence/task-1-docker-run.log`

  **Commit**: YES
  - Message: `chore(server): NestJS 서버 Dockerfile 및 .dockerignore 추가`
  - Files: `packages/server/missionary-server/Dockerfile`, `packages/server/missionary-server/.dockerignore`
  - Pre-commit: `docker build -t missionary-server-test -f packages/server/missionary-server/Dockerfile .`

---

- [x] 2. COOKIE_SECURE 환경변수 지원 코드 수정

  **What to do**:
  - `packages/server/missionary-server/src/auth/auth.controller.ts`에서 cookie `secure` 설정 수정
    - 현재: `secure: process.env.NODE_ENV === 'production'`
    - 변경: `secure: process.env.COOKIE_SECURE === 'true'` (또는 ConfigService 사용)
  - `.env`에 `COOKIE_SECURE=false` 기본값 추가
  - COOKIE_SECURE 환경변수를 문서에 반영

  **Must NOT do**:
  - 기존 인증 로직 변경하지 않음
  - 다른 보안 설정(CORS, JWT 등)을 건드리지 않음
  - `sameSite` 등 다른 쿠키 속성은 변경하지 않음

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일의 환경변수 조건 1줄 수정
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: NestJS ConfigService 패턴과 쿠키 설정 이해

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4)
  - **Blocks**: Task 6 (배포 워크플로우에서 이 변수 사용)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/auth/auth.controller.ts` — 현재 cookie secure 설정 위치 (42번째 줄 부근, `secure: isProduction` 패턴)
  - `packages/server/missionary-server/src/common/queue/bull.module.ts:13-14` — `configService.get<string>('REDIS_HOST', 'localhost')` ConfigService 사용 패턴 참고

  **API/Type References**:
  - `packages/server/missionary-server/.env` — 현재 환경변수 목록, 여기에 COOKIE_SECURE 추가

  **WHY Each Reference Matters**:
  - `auth.controller.ts`: 수정 대상 파일. cookie 설정 위치를 정확히 찾아야 함
  - `bull.module.ts`: ConfigService로 환경변수 읽는 패턴. 같은 패턴을 따를 것

  **Acceptance Criteria**:
  - [x] `nest build` 성공 (타입 에러 없음)
  - [x] 기존 jest 테스트 통과: `pnpm --filter missionary-server test`

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 빌드 성공 확인
    Tool: Bash
    Preconditions: 서버 패키지 의존성 설치됨
    Steps:
      1. pnpm --filter missionary-server build
      2. Assert: exit code 0
      3. Assert: dist/ 디렉토리에 main.js 존재
    Expected Result: 코드 수정 후 빌드 정상
    Evidence: 빌드 출력 캡처

  Scenario: 기존 테스트 통과 확인
    Tool: Bash
    Preconditions: jest 설정 존재
    Steps:
      1. pnpm --filter missionary-server test
      2. Assert: exit code 0
      3. Assert: 기존 4개 테스트 파일 모두 통과
    Expected Result: 기존 기능 영향 없음
    Evidence: jest 결과 출력 캡처

  Scenario: COOKIE_SECURE 환경변수 코드 적용 확인
    Tool: Bash (grep)
    Preconditions: auth.controller.ts 수정 완료
    Steps:
      1. grep -n "COOKIE_SECURE" packages/server/missionary-server/src/auth/auth.controller.ts
      2. Assert: 매치 존재
      3. grep -n "COOKIE_SECURE" packages/server/missionary-server/.env
      4. Assert: 매치 존재
    Expected Result: COOKIE_SECURE 환경변수 참조가 코드와 .env에 모두 존재
    Evidence: grep 결과 캡처
  ```

  **Commit**: YES
  - Message: `fix(auth): COOKIE_SECURE 환경변수로 쿠키 secure 설정 제어`
  - Files: `packages/server/missionary-server/src/auth/auth.controller.ts`, `packages/server/missionary-server/.env`
  - Pre-commit: `pnpm --filter missionary-server build`

---

- [x] 3. docker-compose.prod.yml 작성 (EC2 배포용)

  **What to do**:
  - `packages/server/missionary-server/docker-compose.prod.yml` 생성
  - 서비스 구성:
    - `missionary-server-dev`: NestJS 서버 (포트 3100)
      - Dockerfile 빌드 (context: monorepo root)
      - 환경변수: `.env.dev` 파일 참조
      - healthcheck: `curl -f http://localhost:3100/health`
      - restart: `unless-stopped`
      - depends_on: `redis`
    - `redis`: Redis 7 alpine
      - 포트 6379 (내부만, 외부 노출 불필요)
      - volume: `redis-data` (영속성)
      - healthcheck: `redis-cli ping`
  - `.env.dev.example` 생성 — 실제 배포 시 `.env.dev`로 복사하여 시크릿 채움
  - 네트워크: 기본 bridge 네트워크로 서비스 간 통신 (redis hostname으로 접근)

  **Must NOT do**:
  - PostgreSQL 컨테이너를 추가하지 않음 (RDS 사용)
  - production 서비스를 추가하지 않음 (나중에)
  - `.env.dev` 실제 시크릿을 커밋하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: docker-compose YAML 작성은 표준 패턴. 복잡하지 않음
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: 서버 환경변수와 의존 서비스 이해 필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 6, Task 7
  - **Blocked By**: Task 1 (Dockerfile이 먼저 있어야 compose에서 빌드 가능)

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/docker-compose.yml` — 기존 로컬 개발용 compose 파일. PostgreSQL healthcheck, volume 패턴 참고
  - `packages/server/missionary-server/.env` — 전체 환경변수 목록. `.env.dev.example` 작성 시 참고

  **API/Type References**:
  - `packages/server/missionary-server/src/common/queue/bull.module.ts:13-14` — Redis 연결 설정 (`REDIS_HOST`, `REDIS_PORT`)
  - `packages/server/missionary-server/src/main.ts` — PORT 설정, CORS_ORIGINS 설정

  **WHY Each Reference Matters**:
  - `docker-compose.yml`: 동일 프로젝트의 compose 패턴 (healthcheck 형식, volume 선언 방식)
  - `.env`: 환경변수 전체 목록을 기반으로 `.env.dev.example` 작성
  - `bull.module.ts`: Redis 호스트 기본값이 'localhost'인데 compose에서는 서비스명 'redis'로 변경 필요

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: docker-compose YAML 문법 검증
    Tool: Bash
    Preconditions: docker-compose.prod.yml 작성 완료
    Steps:
      1. docker compose -f packages/server/missionary-server/docker-compose.prod.yml config
      2. Assert: exit code 0 (유효한 YAML)
      3. Assert: 출력에 "missionary-server-dev" 서비스 존재
      4. Assert: 출력에 "redis" 서비스 존재
    Expected Result: 유효한 docker-compose 설정
    Evidence: config 출력 캡처

  Scenario: .env.dev.example 완전성 검증
    Tool: Bash
    Preconditions: .env.dev.example 작성 완료
    Steps:
      1. cat packages/server/missionary-server/.env.dev.example
      2. Assert: DATABASE_URL 포함
      3. Assert: JWT_SECRET 포함
      4. Assert: JWT_REFRESH_SECRET 포함
      5. Assert: AES_ENCRYPT_KEY 포함
      6. Assert: REDIS_HOST 포함
      7. Assert: COOKIE_SECURE 포함
      8. Assert: NODE_ENV 포함
    Expected Result: 배포에 필요한 모든 환경변수 키가 example에 존재
    Evidence: 파일 내용 캡처
  ```

  **Commit**: YES
  - Message: `chore(server): EC2 배포용 docker-compose.prod.yml 및 환경변수 예제 추가`
  - Files: `packages/server/missionary-server/docker-compose.prod.yml`, `packages/server/missionary-server/.env.dev.example`
  - Pre-commit: `docker compose -f packages/server/missionary-server/docker-compose.prod.yml config`

---

- [x] 4. CI 워크플로우 수정 (서버 빌드/테스트 추가)

  **What to do**:
  - `.github/workflows/ci.yaml` 수정:
    - pnpm 버전을 `8` → `10.28.1`로 변경 **(정확히 2곳)**:
      1. **Line 24**: `setup-and-lint` job → `pnpm/action-setup@v3` → `version: 10.28.1`
      2. **Line 77**: `build` job → `pnpm/action-setup@v3` → `version: 10.28.1`
    - build job의 matrix에 `missionary-server` 추가 (Line 59-65 부근)
    - 서버 전용 job 추가: `server-test` (needs: setup-and-lint)
      - Prisma generate 실행 (빌드 전 필수): `pnpm --filter missionary-server prisma:generate`
      - `pnpm --filter missionary-server test` 실행
      - `pnpm --filter missionary-server build` 실행
    - 서버 변경 감지: `paths` 필터로 서버 코드 변경 시에만 서버 job 실행 (선택적)

  **Must NOT do**:
  - 기존 프론트엔드 lint/build job의 로직을 변경하지 않음
  - 기존 matrix (design-system, missionary-admin, missionary-app)을 제거하지 않음
  - deploy 로직을 CI에 넣지 않음 (별도 워크플로우)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: YAML 수정 + GitHub Actions 표준 패턴
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: Prisma generate 순서, 서버 빌드 의존성 이해

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.github/workflows/ci.yaml` — 현재 CI 파일 전체. 기존 구조를 유지하면서 서버 추가
  - `packages/server/missionary-server/package.json:5-21` — 서버 빌드/테스트 스크립트 목록

  **API/Type References**:
  - `packages/server/missionary-server/prisma/schema.prisma:1-4` — `prisma generate` 필요성 (커스텀 output 경로)

  **External References**:
  - pnpm/action-setup: https://github.com/pnpm/action-setup — pnpm 버전 설정

  **WHY Each Reference Matters**:
  - `ci.yaml`: 현재 구조를 이해해야 깨지지 않게 수정 가능. 특히 cache key, matrix 구조
  - `package.json`: 서버의 `test`, `build`, `prisma:generate` 스크립트명 확인
  - `schema.prisma`: prisma generate가 빌드 전에 실행되어야 하는 이유 (커스텀 output)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: CI YAML 문법 검증
    Tool: Bash
    Preconditions: ci.yaml 수정 완료
    Steps:
      1. python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yaml'))" 2>&1 || npx yaml-lint .github/workflows/ci.yaml
      2. Assert: exit code 0
    Expected Result: 유효한 YAML 문법
    Evidence: 검증 출력 캡처

  Scenario: pnpm 버전 수정 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "version:" .github/workflows/ci.yaml | grep pnpm -A1
      2. Assert: "10.28.1" 존재 (또는 10.x)
      3. Assert: "version: 8" 없음
    Expected Result: pnpm 버전이 프로젝트와 일치
    Evidence: grep 결과 캡처

  Scenario: 서버 빌드 matrix 추가 확인
    Tool: Bash (grep)
    Steps:
      1. grep -A5 "matrix:" .github/workflows/ci.yaml
      2. Assert: "missionary-server" 포함
    Expected Result: 서버가 빌드 매트릭스에 포함됨
    Evidence: grep 결과 캡처
  ```

  **Commit**: YES
  - Message: `ci: 서버 빌드/테스트 추가 및 pnpm 버전 수정`
  - Files: `.github/workflows/ci.yaml`
  - Pre-commit: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yaml'))"`

---

- [x] 5. AWS 인프라 셋업 가이드 작성

  **What to do**:
  - `.sisyphus/docs/aws-setup-guide.md` 생성
  - 다음 단계를 구체적 CLI 명령어 또는 콘솔 스크린샷 설명과 함께 작성:
    1. **EC2 인스턴스 생성**
       - AMI: Amazon Linux 2023
       - 인스턴스 타입: t3.micro (Free Tier)
       - 보안 그룹: SSH(22), HTTP(3100) 인바운드
       - 키 페어 생성 및 다운로드
       - Elastic IP 할당 (Free Tier: 실행 중 인스턴스에 무료)
    2. **EC2 초기 설정**
       - Docker + Docker Compose 설치 스크립트
       - Git 설치 및 설정
       - 2GB swap 파일 설정
       - **프로젝트 초기 clone 절차**:
         1. SSH 키 생성 (`ssh-keygen`) 또는 GitHub Deploy Key / Personal Access Token 설정
         2. `git clone https://github.com/<org>/missionary.git /home/ec2-user/missionary` (또는 SSH URL)
         3. `cd /home/ec2-user/missionary && git checkout dev`
         4. pnpm 설치 (corepack enable, Node.js 설치): Docker 내부에서 빌드하므로 호스트에는 불필요할 수 있으나, 수동 디버깅 시 유용
         5. 프로젝트 디렉토리 권한 확인: `chown -R ec2-user:ec2-user /home/ec2-user/missionary`
       - 이후 CI/CD 배포 시 `git pull origin dev`로 업데이트
    3. **RDS PostgreSQL 생성**
       - 엔진: PostgreSQL 16
       - 인스턴스 클래스: db.t3.micro (Free Tier)
       - 스토리지: 20GB gp2
       - 보안 그룹: EC2 보안 그룹에서만 5432 인바운드
       - DB 이름: `missionary_db_dev`
       - 퍼블릭 액세스: No
    4. **GitHub Secrets 설정**
       - 필요한 시크릿 목록과 값 형식
       - `EC2_HOST`, `EC2_SSH_KEY`, `EC2_USERNAME`
       - `DEV_DATABASE_URL`, `DEV_JWT_SECRET` 등
    5. **EC2에 .env.dev 파일 생성**
       - SSH 접속 후 환경변수 파일 생성 절차
    6. **Prisma 초기 마이그레이션**
       - EC2에서 처음 한 번 `prisma migrate deploy` 수동 실행 절차

  **Must NOT do**:
  - Terraform/CDK 코드를 작성하지 않음
  - AWS 자격증명을 문서에 포함하지 않음
  - Production 환경 설정을 포함하지 않음 (dev만)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 기술 문서 작성 — 구체적 단계별 가이드
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: Prisma 마이그레이션, NestJS 서버 운영 환경 이해

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 6 (가이드의 GitHub Secrets 목록이 워크플로우에서 참조됨)
  - **Blocked By**: Task 1 (Dockerfile이 있어야 EC2 배포 절차 기술 가능)

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/.env` — 환경변수 전체 목록 (GitHub Secrets 목록 작성 시 참고)
  - `packages/server/missionary-server/docker-compose.yml` — Docker 네트워킹 패턴 참고

  **External References**:
  - AWS Free Tier: https://aws.amazon.com/free/
  - Amazon Linux 2023 Docker 설치: `dnf install docker`
  - Docker Compose 설치: `curl -L ... docker-compose`

  **WHY Each Reference Matters**:
  - `.env`: 배포에 필요한 모든 환경변수를 누락 없이 가이드에 포함하기 위해
  - `docker-compose.yml`: 기존 로컬 패턴과 EC2 배포 패턴을 비교 설명하기 위해

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 가이드 문서 완전성 검증
    Tool: Bash (grep)
    Preconditions: aws-setup-guide.md 작성 완료
    Steps:
      1. grep -c "## " .sisyphus/docs/aws-setup-guide.md
      2. Assert: 6개 이상의 섹션 헤더
      3. grep "t3.micro" .sisyphus/docs/aws-setup-guide.md
      4. Assert: 매치 존재 (EC2 인스턴스 타입 명시)
      5. grep "db.t3.micro" .sisyphus/docs/aws-setup-guide.md
      6. Assert: 매치 존재 (RDS 인스턴스 타입 명시)
      7. grep "GitHub Secrets" .sisyphus/docs/aws-setup-guide.md
      8. Assert: 매치 존재 (시크릿 설정 가이드)
       9. grep "swap" .sisyphus/docs/aws-setup-guide.md
       10. Assert: 매치 존재 (swap 설정 가이드)
       11. grep "git clone" .sisyphus/docs/aws-setup-guide.md
       12. Assert: 매치 존재 (초기 git clone 절차)
       13. grep "prisma migrate deploy" .sisyphus/docs/aws-setup-guide.md
       14. Assert: 매치 존재 (초기 마이그레이션 가이드)
    Expected Result: 모든 필수 섹션이 가이드에 포함됨
    Evidence: grep 결과 캡처
  ```

  **Commit**: YES
  - Message: `docs: AWS 인프라 셋업 가이드 추가`
  - Files: `.sisyphus/docs/aws-setup-guide.md`
  - Pre-commit: 없음 (문서 파일)

---

- [x] 6. GitHub Actions 배포 워크플로우 작성

  **What to do**:
  - `.github/workflows/deploy-server.yaml` 생성
  - **트리거**: `dev` 브랜치에 push (직접 push 또는 PR merge)
    - `paths` 필터: `packages/server/**` 변경 시에만 실행
  - **Job 구성**:
    1. `test-and-build`:
       - Checkout → pnpm setup (10.28.1) → install
       - Prisma generate
       - `pnpm --filter missionary-server test`
       - `pnpm --filter missionary-server build`
    2. `deploy` (needs: test-and-build):
       - SSH to EC2 via `appleboy/ssh-action@v1`
       - EC2에서 실행할 스크립트:
         ```bash
         cd /home/ec2-user/missionary
         git pull origin dev
         cd packages/server/missionary-server
         docker compose -f docker-compose.prod.yml build --no-cache
         docker compose -f docker-compose.prod.yml run --rm missionary-server-dev npx prisma migrate deploy
         docker compose -f docker-compose.prod.yml up -d
         docker system prune -f
         ```
  - **GitHub Secrets 참조**:
    - `EC2_HOST`: EC2 Elastic IP
    - `EC2_SSH_KEY`: EC2 키페어 private key
    - `EC2_USERNAME`: `ec2-user`
    - 서버 환경변수는 EC2의 `.env.dev` 파일에 직접 관리 (워크플로우에는 포함 안함)

  **Must NOT do**:
  - 환경변수 시크릿을 워크플로우 로그에 출력하지 않음
  - `prisma migrate dev`를 실행하지 않음 (`deploy`만)
  - production 배포 트리거를 추가하지 않음 (나중에)
  - 기존 `ci.yaml`의 PR 체크 로직을 중복하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: GitHub Actions + SSH 배포 + Docker Compose + Prisma 마이그레이션 통합. 여러 시스템이 맞물리는 복합 작업
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: Prisma 마이그레이션 순서, NestJS 빌드 프로세스 이해

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential)
  - **Blocks**: Task 7
  - **Blocked By**: Task 3, Task 4, Task 5

  **References**:

  **Pattern References**:
  - `.github/workflows/ci.yaml` — 기존 GitHub Actions 구조 (pnpm setup, cache, checkout 패턴)
  - `packages/server/missionary-server/docker-compose.prod.yml` — Task 3에서 생성된 compose 파일 (서비스명, 빌드 컨텍스트)

  **API/Type References**:
  - `packages/server/missionary-server/package.json:16-17` — `prisma:migrate:deploy` 스크립트

  **External References**:
  - appleboy/ssh-action: https://github.com/appleboy/ssh-action — SSH 배포 액션
  - GitHub Actions 공식 문서: https://docs.github.com/en/actions

  **WHY Each Reference Matters**:
  - `ci.yaml`: 동일한 pnpm setup, cache 패턴을 재사용하여 일관성 유지
  - `docker-compose.prod.yml`: 배포 스크립트에서 정확한 서비스명과 파일 경로 참조
  - `package.json`: prisma 마이그레이션 스크립트명 확인

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 워크플로우 YAML 문법 검증
    Tool: Bash
    Preconditions: deploy-server.yaml 작성 완료
    Steps:
      1. python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-server.yaml'))"
      2. Assert: exit code 0
    Expected Result: 유효한 YAML
    Evidence: 검증 출력 캡처

  Scenario: 워크플로우 구조 검증
    Tool: Bash (grep)
    Steps:
      1. grep "on:" .github/workflows/deploy-server.yaml
      2. Assert: push 트리거 존재
      3. grep "dev" .github/workflows/deploy-server.yaml
      4. Assert: dev 브랜치 타겟
      5. grep "appleboy/ssh-action" .github/workflows/deploy-server.yaml
      6. Assert: SSH 배포 액션 사용
      7. grep "prisma migrate deploy" .github/workflows/deploy-server.yaml
      8. Assert: 마이그레이션 자동 실행 포함
      9. grep "docker compose" .github/workflows/deploy-server.yaml
      10. Assert: Docker Compose 명령어 포함
    Expected Result: 배포 워크플로우에 모든 필수 단계 포함
    Evidence: grep 결과 캡처

  Scenario: 시크릿 참조 검증
    Tool: Bash (grep)
    Steps:
      1. grep "secrets\." .github/workflows/deploy-server.yaml
      2. Assert: EC2_HOST 참조 존재
      3. Assert: EC2_SSH_KEY 참조 존재
      4. Assert: EC2_USERNAME 참조 존재
    Expected Result: 필요한 시크릿이 모두 참조됨
    Evidence: grep 결과 캡처
  ```

  **Commit**: YES
  - Message: `ci: 서버 dev 환경 자동 배포 워크플로우 추가`
  - Files: `.github/workflows/deploy-server.yaml`
  - Pre-commit: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-server.yaml'))"`

---

- [x] 7. 통합 검증 (로컬 Docker Compose 기동 테스트)

  **What to do**:
  - 로컬에서 docker-compose.prod.yml로 전체 스택 기동 테스트
  - 로컬 `.env.dev` 생성 (테스트용 값, 로컬 PostgreSQL 또는 기존 docker-compose의 DB 활용)
  - Docker Compose up → health check → API 응답 확인 → down
  - 모든 이전 Task의 결과물이 올바르게 연동되는지 확인

  **Must NOT do**:
  - 실제 AWS에 배포하지 않음 (AWS 셋업은 사용자가 가이드 따라 수동으로)
  - 테스트용 `.env.dev`를 커밋하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: docker compose up/down + curl 검증. 표준적 통합 테스트
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: 서버 기동 확인, 에러 디버깅 시 NestJS 로그 해석 필요

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Final)
  - **Blocks**: None (final task)
  - **Blocked By**: All previous tasks

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/docker-compose.prod.yml` — Task 3에서 생성된 배포용 compose
  - `packages/server/missionary-server/docker-compose.yml` — 기존 로컬 DB (PostgreSQL이 여기서 실행 중일 수 있음)
  - `packages/server/missionary-server/.env.dev.example` — Task 3에서 생성된 환경변수 예제

  **WHY Each Reference Matters**:
  - `docker-compose.prod.yml`: 실제 배포 대상 compose 파일로 기동
  - `docker-compose.yml`: 로컬 PostgreSQL이 이미 실행 중이면 포트 충돌 가능성 확인
  - `.env.dev.example`: 테스트용 `.env.dev` 작성 시 기본값 참고

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Docker Compose 전체 스택 기동
    Tool: Bash (docker compose)
    Preconditions: Dockerfile, docker-compose.prod.yml 존재. 로컬 PostgreSQL(missionary-db) 실행 중
    Steps:
      1. cp packages/server/missionary-server/.env.dev.example packages/server/missionary-server/.env.dev
      2. .env.dev 파일에 로컬 DB URL 설정: DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/missionary_db?schema=public"
      3. 기타 필수 환경변수 설정 (JWT_SECRET, JWT_REFRESH_SECRET, AES_ENCRYPT_KEY)
      4. docker compose -f packages/server/missionary-server/docker-compose.prod.yml up -d
      5. sleep 10 (컨테이너 기동 대기)
      6. docker compose -f packages/server/missionary-server/docker-compose.prod.yml ps
      7. Assert: missionary-server-dev 상태 "Up" + "(healthy)"
      8. Assert: redis 상태 "Up" + "(healthy)"
    Expected Result: 모든 컨테이너 정상 기동
    Evidence: docker ps 출력 캡처 → .sisyphus/evidence/task-7-compose-ps.txt

  Scenario: Health check API 응답
    Tool: Bash (curl)
    Preconditions: 컨테이너 기동 완료
    Steps:
      1. curl -s http://localhost:3100/health
      2. Assert: 응답에 "ok" 포함
      3. curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/health
      4. Assert: HTTP 200
    Expected Result: Health check 정상 응답
    Evidence: curl 응답 캡처 → .sisyphus/evidence/task-7-health-check.txt

  Scenario: Swagger 접근 확인
    Tool: Bash (curl)
    Preconditions: 컨테이너 기동 완료
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/api-docs
      2. Assert: HTTP 200 또는 301
    Expected Result: Swagger UI 접근 가능
    Evidence: HTTP 상태 코드 캡처

  Scenario: Redis 연결 확인
    Tool: Bash (docker exec)
    Preconditions: Redis 컨테이너 기동
    Steps:
      1. docker exec $(docker ps -qf "name=redis") redis-cli ping
      2. Assert: "PONG"
    Expected Result: Redis 정상 응답
    Evidence: redis-cli 출력 캡처

  Scenario: 정리 (Cleanup)
    Tool: Bash
    Steps:
      1. docker compose -f packages/server/missionary-server/docker-compose.prod.yml down -v
      2. rm packages/server/missionary-server/.env.dev
      3. Assert: exit code 0
    Expected Result: 테스트 환경 깨끗하게 정리
    Evidence: docker compose down 출력 캡처
  ```

  **Evidence to Capture:**
  - [x] docker ps 출력: `.sisyphus/evidence/task-7-compose-ps.txt`
  - [x] health check 응답: `.sisyphus/evidence/task-7-health-check.txt`
  - [x] 전체 docker logs: `.sisyphus/evidence/task-7-server-logs.txt`

  **Commit**: NO (테스트용 파일은 커밋하지 않음)

---

## Commit Strategy

| After Task | Message                                                                   | Files                                     | Verification          |
| ---------- | ------------------------------------------------------------------------- | ----------------------------------------- | --------------------- |
| 1          | `chore(server): NestJS 서버 Dockerfile 및 .dockerignore 추가`             | Dockerfile, .dockerignore                 | docker build 성공     |
| 2          | `fix(auth): COOKIE_SECURE 환경변수로 쿠키 secure 설정 제어`               | auth.controller.ts, .env                  | nest build + jest     |
| 3          | `chore(server): EC2 배포용 docker-compose.prod.yml 및 환경변수 예제 추가` | docker-compose.prod.yml, .env.dev.example | docker compose config |
| 4          | `ci: 서버 빌드/테스트 추가 및 pnpm 버전 수정`                             | ci.yaml                                   | YAML lint             |
| 5          | `docs: AWS 인프라 셋업 가이드 추가`                                       | aws-setup-guide.md                        | —                     |
| 6          | `ci: 서버 dev 환경 자동 배포 워크플로우 추가`                             | deploy-server.yaml                        | YAML lint             |
| 7          | —                                                                         | (no commit)                               | 통합 테스트만         |

---

## Success Criteria

### Verification Commands

```bash
# 1. Docker 이미지 빌드 성공
docker build -t missionary-server -f packages/server/missionary-server/Dockerfile .
# Expected: exit 0, image < 500MB

# 2. Docker Compose 기동 + 헬스체크
docker compose -f packages/server/missionary-server/docker-compose.prod.yml up -d
curl -s http://localhost:3100/health
# Expected: {"status":"ok"}

# 3. 서버 빌드 성공
pnpm --filter missionary-server build
# Expected: exit 0

# 4. 테스트 통과
pnpm --filter missionary-server test
# Expected: all tests pass

# 5. CI YAML 유효성
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yaml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-server.yaml'))"
# Expected: exit 0 for both
```

### Final Checklist

- [x] Dockerfile이 멀티스테이지 빌드를 사용하고 bcrypt 빌드 도구를 포함
- [x] Prisma generate가 Docker 빌드 시 실행되고 커스텀 output 경로 포함
- [x] docker-compose.prod.yml에 NestJS + Redis 서비스 정의
- [x] .env.dev.example에 모든 필수 환경변수 키 포함
- [x] CI에서 서버 lint + type-check + test + build 실행
- [x] CI pnpm 버전이 10.28.1 (via packageManager field)
- [x] 배포 워크플로우가 dev 브랜치 push 시 트리거
- [x] 배포 시 prisma migrate deploy 자동 실행
- [x] COOKIE_SECURE 환경변수로 cookie secure 설정 제어 가능
- [x] AWS 셋업 가이드에 EC2 + RDS + Security Group + GitHub Secrets 모두 포함
- [x] 로컬 Docker Compose 통합 테스트 통과
