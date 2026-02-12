# Learnings — backend-deploy

## Conventions & Patterns

(Subagents will append findings here)

---

## CI/CD Configuration

### pnpm Version Mismatch Issue

- **Problem**: CI workflow used pnpm v8 while project requires v10.28.1
- **Root Cause**: Hardcoded version in GitHub Actions workflow not synced with project requirements
- **Solution**: Updated all 3 occurrences of pnpm version in `.github/workflows/ci.yaml`:
  - `setup-and-lint` job
  - `build` job
  - `server-test` job (newly added)
- **Prevention**: Consider using `packageManager` field from `package.json` or a shared variable

### Server Build Integration

- **Approach**: Added dedicated `server-test` job instead of just adding to matrix
- **Rationale**:
  - Server requires `prisma generate` before build (custom output path: `./generated/prisma`)
  - Different build pipeline than frontend packages
  - Clearer separation of concerns in CI logs
- **Job Structure**:
  1. Install dependencies
  2. Run `prisma:generate` (generates Prisma Client to custom path)
  3. Run tests
  4. Run build
- **Matrix Addition**: Also added `missionary-server` to build matrix for consistency

### GitHub Actions Best Practices Applied

- Used exact pnpm version (10.28.1) instead of major version (10)
- Maintained consistent Node.js version (20) across all jobs
- Used `needs: setup-and-lint` to ensure lint passes before build/test
- Separated server-specific steps into dedicated job for clarity

## Docker Compose Production Configuration

### Service Architecture

- **Two-service setup**: NestJS server + Redis queue
- **Build context**: Monorepo root (`../../../`) to access all workspace packages
- **Dockerfile location**: `packages/server/missionary-server/Dockerfile`
- **Network**: Default bridge network (services communicate via service names)

### Environment Variable Strategy

- **Pattern**: Use `env_file: .env.dev` instead of hardcoded environment variables
- **Rationale**:
  - Cleaner compose file (no secrets in YAML)
  - Easy to swap environments (dev/staging/prod)
  - Follows 12-factor app principles
- **Files**:
  - `.env.dev.example`: Template with placeholder values (committed to git)
  - `.env.dev`: Actual secrets (gitignored, created during deployment)

### Redis Configuration

- **Image**: `redis:7-alpine` (lightweight, production-ready)
- **Port**: 6379 (internal only, not exposed to host)
- **Volume**: `redis-data` for queue persistence across container restarts
- **Hostname**: Service name `redis` used in `REDIS_HOST` env var (not `localhost`)
- **Healthcheck**: `redis-cli ping` ensures Redis is ready before server starts

### NestJS Server Configuration

- **Port**: 3100 (mapped to host for external access)
- **Healthcheck**: `curl -f http://localhost:3100/health || exit 1`
  - Requires `/health` endpoint in server (exists in app.controller.ts)
  - `start_period: 40s` allows time for Prisma generation and app startup
- **Restart policy**: `unless-stopped` (survives reboots, manual stop only)
- **Dependency**: Waits for Redis healthcheck before starting

### New Environment Variables Added

- `REDIS_HOST=redis`: Docker Compose service name (not localhost)
- `REDIS_PORT=6379`: Standard Redis port
- `COOKIE_SECURE=true`: Production security setting (from Task 2)
- `PORT=3100`: Explicit port configuration
- `CORS_ORIGINS`: Production frontend URLs (comma-separated)

### Validation Approach

- **Command**: `docker compose -f docker-compose.prod.yml config`
- **Issue**: Requires `.env.dev` file to exist (even for syntax validation)
- **Workaround**: Create temporary `.env.dev` from example for validation, then remove

### Production Deployment Checklist

1. Copy `.env.dev.example` to `.env.dev`
2. Fill in actual secrets (JWT, OAuth, AES key, DATABASE_URL)
3. Update `CORS_ORIGINS` with production frontend URLs
4. Update OAuth callback URLs to production domain
5. Set `COOKIE_SECURE=true` for HTTPS
6. Run `docker compose -f docker-compose.prod.yml up -d`
7. Verify healthchecks: `docker compose ps`

## AWS Infrastructure Setup (Manual)

### EC2 Resource Constraints & Swap

- **Issue**: `t3.micro` instances have only 1GB RAM, which is often insufficient for `pnpm install` and NestJS build processes within Docker.
- **Solution**: Configured **2GB swap file** to prevent Out-Of-Memory (OOM) errors during the build stage.
- **Commands**:
  ```bash
  sudo dd if=/dev/zero of=/swapfile bs=128M count=16
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```

### Initial Project Deployment Flow

- **Pattern**: Manual `git clone` on EC2 is documented as a critical first step before CI/CD takes over.
- **Key Steps**:
  1. SSH Key generation and GitHub Deploy Key registration.
  2. `git clone` to a stable path (`/home/ec2-user/missionary`).
  3. Explicitly switching to the `dev` branch.
  4. Correcting directory ownership (`chown -R ec2-user`).

### RDS & Security Group Best Practices

- **Security**: RDS is configured with **Public Access: No**.
- **Inbound Rules**: RDS security group ONLY allows PostgreSQL (5432) traffic from the EC2 security group (Security Group Peering).
- **Initialization**: Database name must match the application's expected name (`missionary_db_dev`).

### First-time Migration

- **Insight**: Even with CI/CD, the very first database migration (`prisma migrate deploy`) is often safer when executed manually from the EC2 instance to verify connectivity and initial schema state.
- **Verification**: Used `docker exec` to run migration inside the container after the first deployment.

## Deploy Workflow (deploy-server.yaml)

### Workflow Structure (Already Created by Previous Task)

- **File**: `.github/workflows/deploy-server.yaml` was already created and complete
- **Two jobs**: `test-and-build` → `deploy` (sequential via `needs`)
- **Concurrency**: `deploy-server-${{ github.ref }}` with `cancel-in-progress: true` — prevents overlapping deployments

### pnpm Setup Pattern

- Uses `pnpm/action-setup@v4` WITHOUT explicit version — reads from `packageManager` field in `package.json`
- This is consistent with the CI workflow pattern (both workflows use the same approach)
- Advantage: Single source of truth for pnpm version

### Deploy Job Design Decisions

- **appleboy/ssh-action@v1**: Single SSH step executes entire deploy script on EC2
- **No artifacts passed**: Deploy job doesn't need build artifacts — EC2 does its own `git pull` + `docker build`
- **Docker build on EC2**: Build happens on the server itself, not in CI (simpler than pushing images to registry)
- **Sequential docker commands**: build → migrate → up ensures clean deployment order

### Key Script Details

- `docker compose run --rm`: Runs one-off migration container that auto-removes after completion
- `docker system prune -f`: Cleans up dangling images/containers after deployment to save disk space
- No environment variables in workflow — all secrets managed via EC2's `.env.dev` file

### Validation Approach

- Python yaml.safe_load for syntax validation
- Note: Python YAML parses `on:` key as boolean `True` — access via `data[True]`
- Content-based grep checks for all required elements (secrets, commands, flags)

## Task 1 (Revisit): Dockerfile 작성

### bcrypt 네이티브 모듈 빌드

- `bcrypt` v6는 네이티브 C++ 모듈 → Alpine에서 `python3 make g++` 필수
- `npm rebuild bcrypt`로 타겟 아키텍처용 재빌드 가능
- `--ignore-scripts` + `npm rebuild bcrypt` 패턴으로 안전한 네이티브 빌드

### Prisma generate 시 DATABASE_URL 필요

- `prisma.config.ts`가 `dotenv/config` import + `env('DATABASE_URL')` 호출
- generate는 DB 연결 안 하지만 config 파싱 단계에서 env 변수 필요
- 더미 값으로 대체: `DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"`

### pnpm 모노레포 Docker: pnpm deploy 함정

- `pnpm deploy --legacy`는 workspace 루트 의존성까지 resolve (Next.js 380MB 포함!)
- pnpm v10에서 `pnpm deploy`는 `inject-workspace-packages=true` 또는 `--legacy` 필요
- **해결**: 3-stage 빌드 — Stage 2에서 `npm install --omit=dev` (workspace 외부) 사용
- 이 패턴이 가장 깔끔: builder(pnpm+workspace) → prod-deps(npm+standalone) → runner(copy only)

### 이미지 크기

- pnpm deploy --legacy: 876MB (Next.js, TypeScript 등 불필요 패키지 포함)
- npm install --omit=dev (standalone): 471MB ✅ (<500MB 목표 달성)

## Local Integration Testing (Task 7)

### Test Execution Pattern
- **Approach**: Create temporary `.env.dev` from `.env.dev.example` with test values
- **Database Strategy**: Use `host.docker.internal:5432` to connect to local PostgreSQL from Docker container
- **Wait Time**: 45 seconds (start_period: 40s + 5s buffer) ensures all services reach healthy status
- **Verification Order**: 
  1. `docker compose ps` → check all services healthy
  2. `curl /health` → verify NestJS server responds
  3. `curl /api-docs` → verify Swagger UI accessible
  4. `docker exec redis-cli ping` → verify Redis connectivity

### Key Findings
- **Port Conflicts**: Check for existing processes on port 3100 before starting (`lsof -i :3100`)
- **Service Dependencies**: Redis must reach healthy status before server starts (depends_on with condition)
- **Healthcheck Timing**: Server healthcheck requires 40s start_period for Prisma generation + app startup
- **Orphan Containers**: Warning about orphan containers (missionary-db) is expected if local dev compose is running

### Environment Variable Validation
- **DATABASE_URL**: `host.docker.internal` works for Docker → host PostgreSQL on macOS
- **REDIS_HOST**: Must be `redis` (Docker service name), NOT `localhost`
- **COOKIE_SECURE**: Set to `false` for local HTTP testing
- **AES_ENCRYPT_KEY**: Requires 64-character hex string (32 bytes)
- **JWT Secrets**: Any non-empty string works for local testing

### Cleanup Best Practices
- **Command**: `docker compose down -v` removes containers AND volumes
- **Network Errors**: "active endpoints" error during network cleanup is harmless if containers are removed
- **Verification**: Check `docker ps -a`, `docker volume ls`, and file existence after cleanup
- **Temporary Files**: Always remove `.env.dev` after testing (contains test secrets)

### Integration Success Criteria
✅ All services reach healthy status
✅ Health endpoint returns `{"status":"ok"}`
✅ Swagger UI returns HTTP 200
✅ Redis responds to ping
✅ No errors in application startup logs
✅ Clean teardown without leftover resources

### Production Readiness Checklist
- [x] Dockerfile builds successfully with bcrypt support
- [x] Prisma Client generates to custom path
- [x] docker-compose.prod.yml services start and reach healthy status
- [x] Service dependency chain works correctly
- [x] Health check endpoint functional
- [x] Redis integration operational
- [x] Environment variable loading works
- [x] Clean teardown process verified


## Plan Completion Summary

### All Tasks Complete ✅

**Date**: 2026-02-12
**Total Tasks**: 7/7 complete
**Total Checkboxes**: 23/23 complete (7 main tasks + 5 Definition of Done + 11 Final Checklist)

### Deliverables Created

1. **Infrastructure Files**:
   - `packages/server/missionary-server/Dockerfile` - 3-stage multistage build (471MB final image)
   - `packages/server/missionary-server/.dockerignore` - Build context exclusions
   - `packages/server/missionary-server/docker-compose.prod.yml` - NestJS + Redis services
   - `packages/server/missionary-server/.env.dev.example` - Environment variable template

2. **CI/CD Workflows**:
   - `.github/workflows/ci.yaml` - Updated with server build/test job
   - `.github/workflows/deploy-server.yaml` - Automated deployment to EC2

3. **Documentation**:
   - `.sisyphus/docs/aws-setup-guide.md` - Complete AWS infrastructure setup guide (125 lines)

4. **Code Changes**:
   - `packages/server/missionary-server/src/auth/auth.controller.ts` - COOKIE_SECURE environment variable support

5. **Evidence Files**:
   - Task 1: docker-build.log, docker-run.log
   - Task 7: compose-ps.txt, health-check.txt, server-logs.txt, integration-test.txt, summary.txt

### Verification Status

✅ All automated tests passed
✅ All manual code reviews completed
✅ All evidence captured
✅ All commits made to git
✅ Local integration test successful
✅ All Definition of Done items verified
✅ All Final Checklist items verified

### Next Steps (Manual - User Action Required)

1. **AWS Infrastructure Setup** (follow `.sisyphus/docs/aws-setup-guide.md`):
   - Create EC2 instance (t3.micro)
   - Create RDS PostgreSQL (db.t3.micro)
   - Configure security groups
   - Set up SSH keys
   - Clone repository on EC2
   - Create `.env.dev` file with production secrets

2. **GitHub Secrets Configuration**:
   - `EC2_HOST` - EC2 Elastic IP
   - `EC2_SSH_KEY` - EC2 private key
   - `EC2_USERNAME` - ec2-user

3. **First Deployment**:
   - Push to `dev` branch triggers auto-deploy
   - First-time Prisma migration runs automatically
   - Verify health endpoint: `curl http://<EC2_IP>:3100/health`

### Plan Status: COMPLETE

All tasks executed, verified, and committed. Infrastructure is ready for AWS deployment.
