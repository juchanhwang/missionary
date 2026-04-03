# Missionary Monorepo Dependency Upgrade Plan

## TL;DR

> **Quick Summary**: pnpm workspace 모노레포의 의존성을 안전 순서(마이너/패치 -> DS 통일 -> 메이저)로 업데이트한다. Wave별 병렬 실행 + 검증 게이트를 통해 회귀를 조기 차단한다.
>
> **Deliverables**:
> - 마이너/패치 의존성 전체 업데이트 (root + client + server)
> - design-system vitest 2.x -> 4.x 메이저 통일
> - lucide-react 0.x -> 1.x 메이저 업그레이드
> - Storybook 8.x -> 10.x 메이저 업그레이드
> - Vite 6.x -> 8.x + @vitejs/plugin-react 5.x -> 6.x 메이저 업그레이드
> - jsdom 28 -> 29 메이저 업그레이드
> - ESLint 9 -> 10 + @eslint/js 9 -> 10 + globals 16 -> 17 메이저 업그레이드
> - TypeScript 5.9 -> 6.0 메이저 업그레이드
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 10 Waves (Wave 내 병렬 포함)
> **Critical Path**: Wave 1 (minor/patch) -> Wave 2 (DS vitest) -> Wave 3-4 (toolchain majors) -> Wave 5+ (app majors)
> **Skip**: `@types/node` 22 -> 25 (Node 22 사용 중이므로 불필요)

---

## Context

### Original Request
missionary 모노레포의 의존성을 안전하게 업데이트하는 작업 계획 수립. 마이너/패치는 병렬로, 메이저는 개별 Wave로 분리하고 롤백 전략을 포함해야 한다.

### Project Structure
- **Root**: 공통 의존성 (next, react, typescript, eslint)
- **packages/client/missionary-app**: Next.js 16 App Router (사용자용)
- **packages/client/missionary-admin**: Next.js 16 App Router (관리자용)
- **packages/client/design-system**: `@samilhero/design-system` (Vite 빌드 라이브러리)
- **packages/server/missionary-server**: NestJS 11 API 서버

### Key Constraints
- **Git Worktree**: `main` worktree에서 직접 작업 금지. `scripts/wt new <branch>` 사용 필수
- **Lockfile**: `pnpm-lock.yaml` 하나. 모든 worktree에서 공유
- **Build 의존 체인**: design-system -> admin (admin 빌드 시 DS 빌드 선행 필요), app은 독립
- **커밋 컨벤션**: 한글 subject, Wave/Task 단위 커밋 분리, type 혼합 금지

---

## Work Objectives

### Core Objective
모노레포 전체 의존성을 최신 호환 버전으로 업데이트하되, 각 단계에서 빌드/테스트/린트 검증을 통과시켜 회귀를 방지한다.

### Concrete Deliverables
- 업데이트된 `package.json` 파일들 (root + 4개 패키지)
- 업데이트된 `pnpm-lock.yaml`
- 메이저 업그레이드에 필요한 코드 마이그레이션 (breaking change 대응)
- 모든 검증 명령어 통과 상태

### Definition of Done
- [ ] `pnpm type-check` PASS
- [ ] `pnpm lint:all` PASS
- [ ] `pnpm build:ds` PASS
- [ ] `pnpm build:admin` PASS
- [ ] `pnpm build:app` PASS
- [ ] `pnpm --filter design-system test` PASS
- [ ] `pnpm --filter missionary-app test:run` PASS
- [ ] `pnpm --filter missionary-admin test` PASS
- [ ] `pnpm --filter missionary-server test` PASS

### Must Have
- Wave별 검증 게이트 (검증 실패 시 해당 Wave 롤백 후 다음 진행)
- 메이저 업그레이드별 독립 커밋 (롤백 가능 단위)
- `@types/node` 25 skip

### Must NOT Have (Guardrails)
- `main` worktree에서 직접 코드 수정 (worktree 생성 필수)
- 검증 없는 메이저 업그레이드 반영
- 한 커밋에 여러 type 혼합 (feat + chore 등)
- `@types/node` 22 -> 25 업그레이드

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** -- ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest for client, Jest for server)
- **Automated tests**: Tests-after (기존 테스트 스위트 실행으로 회귀 검증)
- **Framework**: Vitest (client), Jest (server)

### QA Policy
매 Wave 완료 후 아래 검증 명령어를 실행한다. 실패 시 해당 Wave 변경사항을 수정하거나 롤백한다.

**검증 레벨 (누적 적용):**
- **Level 1 (Quick)**: `pnpm type-check`
- **Level 2 (Lint)**: `pnpm lint:all`
- **Level 3 (Build)**: `pnpm build:ds && pnpm build:admin && pnpm build:app`
- **Level 4 (Test)**: 각 패키지 테스트 실행
- **Full Gate**: Level 1-4 전체 (메이저 업그레이드 후 필수)

---

## Execution Strategy

### Worktree Setup (사전 준비)
```bash
# main worktree에서 실행
cd /Users/JuChan/Documents/FE/missionary/main
scripts/wt new chore/dependency-upgrade
# 이후 모든 작업은 해당 worktree에서 수행
```

### Parallel Execution Waves

| Wave | 작업 | 병렬 가능 | 의존성 |
|------|------|-----------|--------|
| 0 | Worktree 생성 + 브랜치 준비 | - | 없음 |
| 1 | 마이너/패치 업데이트 (root + client + server) | Wave 내 3개 Task 병렬 | 없음 |
| 2 | DS vitest 2.x -> 4.x 통일 | 단독 | Wave 1 |
| 3 | Vite 6 -> 8 + @vitejs/plugin-react 5 -> 6 | 단독 | Wave 2 |
| 4 | jsdom 28 -> 29 (app + admin) | 단독 | Wave 3 |
| 5 | lucide-react 0.x -> 1.x (admin + DS) | 단독 | Wave 4 |
| 6 | Storybook 8.x -> 10.x (DS) | 단독 | Wave 5 |
| 7 | ESLint 9 -> 10 + @eslint/js 9 -> 10 + globals 16 -> 17 | 단독 | Wave 6 |
| 8 | TypeScript 5.9 -> 6.0 | 단독 | Wave 7 |
| 9 | Final Verification | 단독 | Wave 8 |

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T0: Worktree 준비 | - | 전체 | 0 |
| T1a: Root 마이너/패치 | T0 | T2 | 1 |
| T1b: Client 마이너/패치 | T0 | T2 | 1 |
| T1c: Server 마이너/패치 | T0 | T2 | 1 |
| T2: DS vitest 통일 | T1a,b,c | T3 | 2 |
| T3: Vite + plugin-react 메이저 | T2 | T4 | 3 |
| T4: jsdom 메이저 | T3 | T5 | 4 |
| T5: lucide-react 메이저 | T4 | T6 | 5 |
| T6: Storybook 메이저 | T5 | T7 | 6 |
| T7: ESLint 생태계 메이저 | T6 | T8 | 7 |
| T8: TypeScript 메이저 | T7 | T9 | 8 |
| T9: Final Verification | T8 | - | 9 |

---

## TODOs

- [ ] 0. Worktree 생성 및 브랜치 준비

  **What to do**:
  - `main` worktree에서 `scripts/wt new chore/dependency-upgrade` 실행
  - 생성된 worktree 경로로 이동
  - `pnpm install` 실행하여 초기 상태 확인
  - 모든 검증 명령어(`pnpm type-check`, `pnpm lint:all`, 빌드, 테스트)를 한 번 실행하여 baseline 기록

  **Must NOT do**:
  - `main` worktree에서 직접 코드 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 CLI 명령어 실행
  - **Skills**: 없음

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0)
  - **Blocks**: T1a, T1b, T1c (Wave 1 전체)
  - **Blocked By**: None

  **References**:
  - **Pattern References**: 워크스페이스 루트 CLAUDE.md의 "Worktree Workflow" 섹션
  - **Script References**: `/Users/JuChan/Documents/FE/missionary/scripts/wt`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Worktree 생성 확인
    Tool: Bash
    Preconditions: main worktree에서 시작
    Steps:
      1. scripts/wt new chore/dependency-upgrade
      2. ls로 worktree 디렉토리 존재 확인
      3. git branch --show-current로 브랜치 확인
    Expected Result: chore/dependency-upgrade 브랜치의 worktree가 생성됨
    Evidence: .orchestrator/evidence/task-0-worktree-setup.txt

  Scenario: Baseline 검증 통과 확인
    Tool: Bash
    Preconditions: worktree 내에서 pnpm install 완료
    Steps:
      1. pnpm type-check
      2. pnpm lint:all
      3. pnpm build:ds && pnpm build:admin && pnpm build:app
      4. pnpm --filter design-system test && pnpm --filter missionary-app test:run && pnpm --filter missionary-admin test && pnpm --filter missionary-server test
    Expected Result: 모든 명령어 exit code 0
    Evidence: .orchestrator/evidence/task-0-baseline.txt
  ```

  **Commit**: NO (브랜치 준비만)

---

- [ ] 1a. Root 마이너/패치 의존성 업데이트

  **What to do**:
  - `/main/package.json`에서 아래 의존성 업데이트:
    - `next` 16.1.6 -> 16.2.1
    - `postcss` ^8.5.6 -> ^8.5.8
    - `@types/react` ^19.2.10 -> ^19.2.14
    - `stylelint` ^17.1.1 -> ^17.6.0
    - `typescript-eslint` ^8.54.0 -> ^8.57.0
  - `@types/node`는 ^22.15.0 유지 (skip)
  - `pnpm install` 실행

  **Must NOT do**:
  - `@types/node` 버전 변경
  - root 외 다른 패키지 package.json 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: package.json 버전 번호만 변경하는 단순 작업
  - **Skills**: 없음

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1b, T1c)
  - **Blocks**: T2 (DS vitest 통일)
  - **Blocked By**: T0

  **References**:
  - **API/Type References**: `/Users/JuChan/Documents/FE/missionary/main/package.json` -- 전체 파일
  - **External References**: https://nextjs.org/docs/app/guides/upgrading -- Next.js 16.1 -> 16.2 changelog 확인

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` PASS
  - [ ] `pnpm lint:all` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Root 의존성 버전 확인
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. cat package.json | grep '"next"' -- 16.2.1 확인
      2. cat package.json | grep '"postcss"' -- ^8.5.8 확인
      3. cat package.json | grep '"@types/react"' -- ^19.2.14 확인
      4. cat package.json | grep '"stylelint"' -- ^17.6 확인
      5. cat package.json | grep '"typescript-eslint"' -- ^8.57 확인
      6. cat package.json | grep '"@types/node"' -- ^22.15.0 유지 확인
    Expected Result: 모든 버전이 목표 버전과 일치, @types/node 미변경
    Evidence: .orchestrator/evidence/task-1a-versions.txt

  Scenario: Root 업데이트 후 type-check + lint 통과
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm type-check
      2. pnpm lint:all
    Expected Result: 둘 다 exit code 0
    Evidence: .orchestrator/evidence/task-1a-verify.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): root 마이너/패치 의존성 업데이트`
  - Files: `package.json`, `pnpm-lock.yaml`

---

- [ ] 1b. Client 패키지 마이너/패치 의존성 업데이트

  **What to do**:
  - **missionary-app** (`packages/client/missionary-app/package.json`):
    - `@tanstack/react-query` ^5.90.20 -> ^5.95.0
    - `react-hook-form` ^7.71.1 -> ^7.72.0
    - `axios` ^1.13.4 -> ^1.14.0
    - `react-error-boundary` ^6.1.0 -> ^6.1.1
    - `@tailwindcss/postcss` ^4.1.18 -> ^4.2.2
    - `autoprefixer` ^10.4.24 -> ^10.4.27
    - `sass` ^1.97.3 -> ^1.98.0
    - `tailwindcss` ^4.1.18 -> ^4.2.2
    - `vite-tsconfig-paths` ^6.0.5 -> ^6.1.1
    - `vitest` ^4.0.18 -> ^4.1.2
  - **missionary-admin** (`packages/client/missionary-admin/package.json`):
    - 위와 동일한 공통 패키지 + 아래 추가:
    - `msw` ^2.12.10 -> ^2.12.14
  - **design-system** (`packages/client/design-system/package.json`):
    - `@tailwindcss/vite` ^4.1.18 -> ^4.2.2
    - `tailwind-merge` ^3.4.0 -> ^3.5.0
    - `overlay-kit` ^1.8.6 -> ^1.9.0
    - `react-hook-form` (dev) ^7.54.2 -> ^7.72.0
    - `autoprefixer` ^10.4.24 -> ^10.4.27
    - `sass` ^1.97.3 -> ^1.98.0
    - `tailwindcss` ^4.1.18 -> ^4.2.2
    - `vite-tsconfig-paths` ^6.0.5 -> ^6.1.1
  - `pnpm install` 실행

  **Must NOT do**:
  - DS의 `vitest` (현재 ^2.1.8) 변경 -- Wave 2에서 처리
  - DS의 `vite` (현재 ^6.4.1), `@vitejs/plugin-react` (현재 ^5.1.3) 변경 -- Wave 3에서 처리
  - DS의 `lucide-react`, `storybook` 관련 변경 -- Wave 5, 6에서 처리
  - admin의 `lucide-react` 변경 -- Wave 5에서 처리
  - app/admin의 `jsdom`, `@vitejs/plugin-react` 변경 -- Wave 3, 4에서 처리

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: package.json 버전 번호만 변경
  - **Skills**: 없음

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1a, T1c)
  - **Blocks**: T2
  - **Blocked By**: T0

  **References**:
  - **API/Type References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/package.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/package.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/package.json`

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` PASS
  - [ ] `pnpm build:ds` PASS
  - [ ] `pnpm --filter design-system test` PASS
  - [ ] `pnpm --filter missionary-app test:run` PASS
  - [ ] `pnpm --filter missionary-admin test` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Client 패키지 버전 확인
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. grep '"@tanstack/react-query"' packages/client/missionary-app/package.json -- ^5.95 확인
      2. grep '"tailwindcss"' packages/client/missionary-app/package.json -- ^4.2.2 확인
      3. grep '"vitest"' packages/client/missionary-app/package.json -- ^4.1.2 확인
      4. grep '"vitest"' packages/client/design-system/package.json -- ^2.1.8 유지 확인 (Wave 2 대상)
      5. grep '"msw"' packages/client/missionary-admin/package.json -- ^2.12.14 확인
      6. grep '"overlay-kit"' packages/client/design-system/package.json -- ^1.9.0 확인
    Expected Result: 모든 버전이 목표와 일치, DS vitest는 미변경
    Evidence: .orchestrator/evidence/task-1b-versions.txt

  Scenario: Client 빌드 + 테스트 통과
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm build:ds
      2. pnpm --filter design-system test
      3. pnpm --filter missionary-app test:run
      4. pnpm --filter missionary-admin test
    Expected Result: 모든 명령어 exit code 0
    Evidence: .orchestrator/evidence/task-1b-verify.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): 클라이언트 마이너/패치 의존성 업데이트`
  - Files: `packages/client/missionary-app/package.json`, `packages/client/missionary-admin/package.json`, `packages/client/design-system/package.json`, `pnpm-lock.yaml`

---

- [ ] 1c. Server 패키지 마이너/패치 의존성 업데이트

  **What to do**:
  - `packages/server/missionary-server/package.json`에서:
    - `@nestjs/common` ^11.0.0 -> ^11.1.17
    - `@nestjs/core` ^11.0.0 -> ^11.1.17
    - `@nestjs/platform-express` ^11.0.0 -> ^11.1.17
    - `@nestjs/testing` ^11.1.13 -> ^11.1.17
    - `@prisma/client` ^7.3.0 -> ^7.6.0
    - `@prisma/adapter-pg` ^7.3.0 -> ^7.6.0
    - `prisma` ^7.3.0 -> ^7.6.0
    - `bullmq` ^5.67.3 -> ^5.71.0
    - `ioredis` ^5.9.2 -> ^5.10.0
    - `jest` ^30.2.0 -> ^30.3.0
    - `dotenv` ^17.2.3 -> ^17.3.0
    - `class-validator` ^0.14.3 -> ^0.15.0
  - `pnpm install` 실행
  - Prisma 버전 업 후 `pnpm --filter missionary-server prisma:generate` 실행 필요

  **Must NOT do**:
  - 서버 외 다른 패키지 변경

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 버전 번호 변경 + prisma generate
  - **Skills**: [`nestjs-expert`]
    - `nestjs-expert`: NestJS 패키지 호환성 확인

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1a, T1b)
  - **Blocks**: T2
  - **Blocked By**: T0

  **References**:
  - **API/Type References**: `/Users/JuChan/Documents/FE/missionary/main/packages/server/missionary-server/package.json`
  - **External References**:
    - https://www.prisma.io/docs/orm/more/upgrade-guides -- Prisma 7.3 -> 7.6 변경사항
    - class-validator 0.14 -> 0.15 changelog 확인 (데코레이터 변경 가능)

  **Acceptance Criteria**:
  - [ ] `pnpm --filter missionary-server prisma:generate` PASS
  - [ ] `pnpm type-check` PASS (서버 부분)
  - [ ] `pnpm --filter missionary-server test` PASS
  - [ ] `pnpm --filter missionary-server build` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Server 의존성 버전 확인
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. grep '"@nestjs/common"' packages/server/missionary-server/package.json -- ^11.1.17 확인
      2. grep '"@prisma/client"' packages/server/missionary-server/package.json -- ^7.6.0 확인
      3. grep '"prisma"' packages/server/missionary-server/package.json -- ^7.6.0 확인
      4. grep '"class-validator"' packages/server/missionary-server/package.json -- ^0.15.0 확인
      5. grep '"jest"' packages/server/missionary-server/package.json -- ^30.3.0 확인
    Expected Result: 모든 버전이 목표와 일치
    Evidence: .orchestrator/evidence/task-1c-versions.txt

  Scenario: Server 빌드 + 테스트 통과
    Tool: Bash
    Preconditions: pnpm install + prisma generate 완료
    Steps:
      1. pnpm --filter missionary-server prisma:generate
      2. pnpm --filter missionary-server build
      3. pnpm --filter missionary-server test
    Expected Result: 모든 명령어 exit code 0
    Evidence: .orchestrator/evidence/task-1c-verify.txt

  Scenario: class-validator 0.15 데코레이터 호환성
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. grep -r "class-validator" packages/server/missionary-server/src --include="*.ts" -l 로 사용 파일 목록 확인
      2. pnpm type-check 으로 타입 에러 확인
    Expected Result: 기존 데코레이터 호환, 타입 에러 없음
    Evidence: .orchestrator/evidence/task-1c-class-validator.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): 서버 마이너/패치 의존성 업데이트`
  - Files: `packages/server/missionary-server/package.json`, `pnpm-lock.yaml`

- [ ] 2. Design System vitest 2.x -> 4.x 메이저 업그레이드

  **What to do**:
  - `packages/client/design-system/package.json`에서:
    - `vitest` ^2.1.8 -> ^4.1.2 (app/admin과 동일 버전으로 통일)
  - `pnpm install` 실행
  - `vitest.config.ts` 확인 -- Vitest 4.x 설정 호환성 검토
    - Vitest 3.x에서 `globals` 옵션이 deprecated, 4.x에서 제거 가능
    - `vitest.setup.ts` import 경로 변경 여부 확인
  - 기존 테스트 파일에서 Vitest API 변경사항 대응:
    - `vi.mock` / `vi.fn` 등 기본 API는 호환
    - Reporter, coverage provider 설정 변경 여부 확인
  - DS 테스트 전체 실행하여 회귀 검증

  **Must NOT do**:
  - app/admin의 vitest 버전 변경 (이미 4.x)
  - DS의 다른 의존성 변경

  **Rollback Strategy**:
  ```bash
  # vitest만 2.x로 되돌리기
  cd packages/client/design-system
  pnpm add -D vitest@^2.1.8
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 메이저 업그레이드로 vitest config 마이그레이션 필요 가능
  - **Skills**: [`react-nextjs-testing`]
    - `react-nextjs-testing`: Vitest 설정 마이그레이션 참조

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: T3
  - **Blocked By**: T1a, T1b, T1c

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/vitest.config.ts` -- 현재 DS vitest 설정
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/vitest.config.ts` -- app의 4.x 설정 (참조 패턴)
  - **Test References**: `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/vitest.setup.ts`
  - **External References**: https://vitest.dev/guide/migration -- Vitest 2.x -> 4.x migration guide

  **Acceptance Criteria**:
  - [ ] `pnpm --filter design-system test` PASS
  - [ ] `pnpm build:ds` PASS
  - [ ] `pnpm type-check` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: DS vitest 버전 통일 확인
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. grep '"vitest"' packages/client/design-system/package.json -- ^4.1.2 확인
      2. grep '"vitest"' packages/client/missionary-app/package.json -- ^4.1.2 확인 (동일)
      3. pnpm --filter design-system test
    Expected Result: DS vitest 4.x, 모든 테스트 통과
    Evidence: .orchestrator/evidence/task-2-vitest-upgrade.txt

  Scenario: Vitest config 호환성 확인
    Tool: Bash
    Preconditions: vitest ^4.1.2 설치 완료
    Steps:
      1. cat packages/client/design-system/vitest.config.ts 확인
      2. pnpm --filter design-system test -- vitest 4.x에서 deprecated/removed API 없는지 확인
    Expected Result: config 파일에 deprecated 옵션 없음, 테스트 정상 실행
    Evidence: .orchestrator/evidence/task-2-vitest-config.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): design-system vitest 4.x 메이저 업그레이드`
  - Files: `packages/client/design-system/package.json`, `pnpm-lock.yaml`, (필요 시) `packages/client/design-system/vitest.config.ts`

---

- [ ] 3. Vite 6 -> 8 + @vitejs/plugin-react 5 -> 6 메이저 업그레이드

  **What to do**:
  - **Phase 1: Design System** (`packages/client/design-system/package.json`):
    - `vite` ^6.4.1 -> ^8.0.0
    - `@vitejs/plugin-react` ^5.1.3 -> ^6.0.0
  - **Phase 2: App + Admin** (각 package.json):
    - `@vitejs/plugin-react` ^5.1.3 -> ^6.0.0
    - (app/admin은 Vite를 직접 의존하지 않고 vitest 경유로 사용)
  - `pnpm install` 실행
  - **Breaking Change 대응**:
    - Vite 8 config 변경사항 확인 (`vite.config.ts`)
    - `@vitejs/plugin-react` 6.x의 Babel/SWC 옵션 변경 확인
    - DS의 `vite.config.ts`에서 `react()` 플러그인 옵션 호환성 검증
      - 현재 `babel.plugins: ['babel-plugin-react-compiler']` 사용 -- 6.x에서 옵션 이름/구조 변경 여부 확인
    - `vite-plugin-dts`, `vite-plugin-svgr`, `vite-tsconfig-paths` 호환성 확인
    - Rollup API 변경 영향 체크 (`rollupOptions` in DS vite.config.ts)

  **Must NOT do**:
  - Storybook 관련 변경 (Wave 6에서 별도 처리)
  - DS 외 Vite config 변경 (app/admin은 next.config 기반)

  **Rollback Strategy**:
  ```bash
  # DS
  cd packages/client/design-system
  pnpm add -D vite@^6.4.1 @vitejs/plugin-react@^5.1.3
  # App
  cd packages/client/missionary-app
  pnpm add -D @vitejs/plugin-react@^5.1.3
  # Admin
  cd packages/client/missionary-admin
  pnpm add -D @vitejs/plugin-react@^5.1.3
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 두 메이저 버전 업 동시 처리, Vite config + plugin 호환성 마이그레이션
  - **Skills**: [`frontend-code-quality`]
    - `frontend-code-quality`: 빌드 설정 변경 영향 분석

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: T4
  - **Blocked By**: T2

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/vite.config.ts` -- DS Vite 설정 (Rollup external, dts plugin, alias 등)
  - **API/Type References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/package.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/package.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/package.json`
  - **External References**:
    - https://vite.dev/blog -- Vite 8 release blog (breaking changes)
    - https://github.com/vitejs/vite-plugin-react/blob/main/CHANGELOG.md -- plugin-react 6.x changelog

  **Acceptance Criteria**:
  - [ ] `pnpm build:ds` PASS (Vite 8 빌드 성공)
  - [ ] `pnpm --filter design-system test` PASS
  - [ ] `pnpm --filter missionary-app test:run` PASS
  - [ ] `pnpm --filter missionary-admin test` PASS
  - [ ] `pnpm build:admin` PASS
  - [ ] `pnpm build:app` PASS
  - [ ] `pnpm type-check` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Vite 8 DS 빌드 성공
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm build:ds
      2. ls packages/client/design-system/dist/ -- index.js, index.d.ts 존재 확인
      3. ls packages/client/design-system/dist/styles/ -- CSS 출력 확인
    Expected Result: dist/ 에 정상적인 빌드 산출물 존재
    Evidence: .orchestrator/evidence/task-3-vite-build.txt

  Scenario: @vitejs/plugin-react 6.x 호환성
    Tool: Bash
    Preconditions: 업그레이드 완료
    Steps:
      1. pnpm --filter design-system test -- React compiler plugin 포함 테스트 통과 확인
      2. pnpm --filter missionary-app test:run
      3. pnpm --filter missionary-admin test
    Expected Result: 모든 테스트 통과, babel-plugin-react-compiler 정상 동작
    Evidence: .orchestrator/evidence/task-3-plugin-react.txt

  Scenario: 전체 빌드 체인 확인
    Tool: Bash
    Steps:
      1. pnpm build:ds && pnpm build:admin && pnpm build:app
    Expected Result: 모든 빌드 성공
    Evidence: .orchestrator/evidence/task-3-full-build.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): Vite 8 + @vitejs/plugin-react 6 메이저 업그레이드`
  - Files: `packages/client/design-system/package.json`, `packages/client/missionary-app/package.json`, `packages/client/missionary-admin/package.json`, `pnpm-lock.yaml`, (필요 시) `packages/client/design-system/vite.config.ts`

- [ ] 4. jsdom 28 -> 29 메이저 업그레이드

  **What to do**:
  - **missionary-app** (`packages/client/missionary-app/package.json`):
    - `jsdom` ^28.0.0 -> ^29.0.0
  - **missionary-admin** (`packages/client/missionary-admin/package.json`):
    - `jsdom` ^28.0.0 -> ^29.0.0
  - `pnpm install` 실행
  - **Breaking Change 대응**:
    - jsdom 29의 Node.js 최소 버전 요구사항 확인 (Node 22 호환 여부)
    - `vitest.config.ts`의 `environment: 'jsdom'` 설정 호환성 확인
    - DOM API 변경에 따른 테스트 실패 대응 (주로 `window`, `document` 관련)

  **Must NOT do**:
  - design-system의 jsdom 변경 (DS는 jsdom 미사용 또는 별도 버전)
  - vitest 버전 변경

  **Rollback Strategy**:
  ```bash
  cd packages/client/missionary-app && pnpm add -D jsdom@^28.0.0
  cd packages/client/missionary-admin && pnpm add -D jsdom@^28.0.0
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: jsdom 메이저이지만 보통 테스트 환경에만 영향, 변경 범위 작음
  - **Skills**: [`react-nextjs-testing`]
    - `react-nextjs-testing`: 테스트 환경 호환성 확인

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: T5
  - **Blocked By**: T3

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/vitest.config.ts`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/vitest.config.ts`
  - **Test References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/src/test/setup.ts`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/src/test/setup.ts`
  - **External References**: https://github.com/jsdom/jsdom/blob/main/Changelog.md -- jsdom 29 breaking changes

  **Acceptance Criteria**:
  - [ ] `pnpm --filter missionary-app test:run` PASS
  - [ ] `pnpm --filter missionary-admin test` PASS
  - [ ] `pnpm type-check` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: jsdom 29 테스트 환경 호환성
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm --filter missionary-app test:run
      2. pnpm --filter missionary-admin test
    Expected Result: 모든 테스트 통과, DOM 관련 에러 없음
    Evidence: .orchestrator/evidence/task-4-jsdom-tests.txt

  Scenario: jsdom 29 Node 22 호환 확인
    Tool: Bash
    Steps:
      1. node -v -- v22.x 확인
      2. pnpm --filter missionary-app test:run 2>&1 | head -20 -- 초기화 에러 없음
    Expected Result: Node 22 환경에서 jsdom 29 정상 로드
    Evidence: .orchestrator/evidence/task-4-jsdom-compat.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): jsdom 29 메이저 업그레이드`
  - Files: `packages/client/missionary-app/package.json`, `packages/client/missionary-admin/package.json`, `pnpm-lock.yaml`

---

- [ ] 5. lucide-react 0.x -> 1.x 메이저 업그레이드

  **What to do**:
  - **missionary-admin** (`packages/client/missionary-admin/package.json`):
    - `lucide-react` ^0.563.0 -> ^1.7.0
  - **design-system** (`packages/client/design-system/package.json`):
    - `lucide-react` ^0.563.0 -> ^1.7.0
  - `pnpm install` 실행
  - **Breaking Change 대응 (핵심)**:
    - lucide-react 1.x에서 아이콘 import 경로/이름 변경 가능
    - 일부 아이콘 이름이 rename/deprecated 되었을 수 있음
    - `grep -r "lucide-react" packages/client/ --include="*.tsx" --include="*.ts"` 로 모든 사용처 파악
    - 각 import 구문에서 아이콘 이름 유효성 검증
    - Tree-shaking 방식 변경 여부 확인 (barrel import vs individual import)
    - DS에서 lucide 아이콘을 사용하는 컴포넌트의 export가 변경되면 admin/app 영향 파악

  **Must NOT do**:
  - missionary-app은 lucide-react를 직접 의존하지 않으므로 변경하지 않음
  - 아이콘 디자인/시각적 변경 대응 (기능적 호환만 확인)

  **Rollback Strategy**:
  ```bash
  cd packages/client/design-system && pnpm add lucide-react@^0.563.0
  cd packages/client/missionary-admin && pnpm add lucide-react@^0.563.0
  # + 코드 변경사항 git checkout
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 코드 전체에서 아이콘 import를 검색/수정해야 하는 마이그레이션 작업
  - **Skills**: [`frontend-code-quality`]
    - `frontend-code-quality`: import 패턴 분석 및 일괄 수정

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: T6
  - **Blocked By**: T4

  **References**:
  - **Pattern References**:
    - `grep -r "from 'lucide-react'" packages/client/` 결과의 모든 파일 -- 아이콘 import 사용처
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/src/index.tsx` -- DS가 lucide 아이콘을 re-export하는지 확인
  - **API/Type References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/package.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/package.json`
  - **External References**:
    - https://lucide.dev/guide/packages/lucide-react#migration -- lucide-react 1.x migration guide
    - https://github.com/lucide-icons/lucide/blob/main/MIGRATION.md -- 아이콘 이름 변경 목록

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` PASS (lucide import 타입 에러 없음)
  - [ ] `pnpm build:ds` PASS
  - [ ] `pnpm build:admin` PASS
  - [ ] `pnpm --filter design-system test` PASS
  - [ ] `pnpm --filter missionary-admin test` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: lucide-react import 호환성
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. grep -r "from 'lucide-react'" packages/client/ --include="*.tsx" --include="*.ts" -- 모든 import 확인
      2. pnpm type-check -- 타입 에러 없음
    Expected Result: 모든 아이콘 import가 1.x에서 유효, 타입 에러 0
    Evidence: .orchestrator/evidence/task-5-lucide-imports.txt

  Scenario: lucide-react 1.x 빌드 호환성
    Tool: Bash
    Steps:
      1. pnpm build:ds
      2. pnpm build:admin
    Expected Result: 빌드 성공, lucide 관련 번들 에러 없음
    Evidence: .orchestrator/evidence/task-5-lucide-build.txt

  Scenario: lucide 아이콘 rename 대응 확인
    Tool: Bash
    Steps:
      1. pnpm type-check 2>&1 | grep -i "lucide" -- lucide 관련 에러 없는지 확인
      2. pnpm --filter missionary-admin test
    Expected Result: rename된 아이콘이 있으면 코드에서 대응 완료, 테스트 통과
    Evidence: .orchestrator/evidence/task-5-lucide-rename.txt
  ```

  **Commit**: YES (마이그레이션 코드 변경 포함 시 2커밋 분리)
  - Message 1 (코드 변경 시): `refactor: lucide-react 1.x 아이콘 이름 마이그레이션`
  - Message 2: `chore(deps): lucide-react 1.x 메이저 업그레이드`
  - Files: `packages/client/design-system/package.json`, `packages/client/missionary-admin/package.json`, `pnpm-lock.yaml`, (변경된 .tsx/.ts 파일들)

- [ ] 6. Storybook 8.x -> 10.x 메이저 업그레이드 (Design System)

  **What to do**:
  - `packages/client/design-system/package.json`에서:
    - `storybook` ^8.6.15 -> ^10.3.0
    - `@storybook/addon-essentials` ^8.6.14 -> ^10.3.0
    - `@storybook/addon-interactions` ^8.6.14 -> ^10.3.0
    - `@storybook/addon-links` ^8.6.14 -> ^10.3.0
    - `@storybook/addon-onboarding` ^8.6.14 -> ^10.3.0
    - `@storybook/blocks` ^8.6.14 -> ^10.3.0
    - `@storybook/builder-vite` ^8.6.15 -> ^10.3.0
    - `@storybook/react` ^8.6.14 -> ^10.3.0
    - `@storybook/react-vite` ^8.6.15 -> ^10.3.0
    - `@storybook/test` ^8.6.15 -> ^10.3.0
    - `@chromatic-com/storybook` ^3.2.6 -> ^5.1.0
  - `pnpm install` 실행
  - **Breaking Change 대응 (핵심)**:
    - Storybook 9/10에서 configuration 형식 변경 가능 (`.storybook/main.ts`)
    - `storybook upgrade` CLI를 활용한 자동 마이그레이션 시도:
      ```bash
      cd packages/client/design-system
      npx storybook@latest upgrade
      ```
    - addon API 변경사항 확인
    - Vite builder 호환성 확인 (Vite 8과의 호환)
    - Story format (CSF) 버전 변경 여부 확인
    - `@storybook/addon-onboarding`이 10.x에서 deprecated/removed 여부 확인
    - `@chromatic-com/storybook` 5.x 설정 변경사항 확인

  **Must NOT do**:
  - DS 외 패키지의 Storybook 관련 변경
  - Story 파일 내용 자체의 변경 (format 호환성 문제가 아닌 한)

  **Rollback Strategy**:
  ```bash
  cd packages/client/design-system
  # package.json과 .storybook/ 설정을 git checkout으로 되돌리기
  git checkout -- package.json .storybook/
  pnpm install
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Storybook 8->10은 2개 메이저 점프, config 마이그레이션 필수
  - **Skills**: [`frontend-code-quality`]
    - `frontend-code-quality`: 빌드 도구 설정 마이그레이션

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 6)
  - **Blocks**: T7
  - **Blocked By**: T5

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/.storybook/` -- 현재 Storybook 설정 디렉토리
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/package.json` -- 현재 addon 목록
  - **External References**:
    - https://storybook.js.org/docs/migration-guide -- Storybook 마이그레이션 가이드
    - https://github.com/storybookjs/storybook/blob/next/MIGRATION.md -- 상세 breaking changes
    - https://www.chromatic.com/docs/storybook -- @chromatic-com/storybook 5.x 가이드

  **Acceptance Criteria**:
  - [ ] `pnpm --filter design-system build-storybook` PASS (Storybook 빌드 성공)
  - [ ] `pnpm build:ds` PASS (Vite 빌드에 영향 없음)
  - [ ] `pnpm --filter design-system test` PASS (@storybook/test 호환)
  - [ ] `pnpm type-check` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Storybook 10 빌드 성공
    Tool: Bash
    Preconditions: pnpm install 완료, .storybook/ 마이그레이션 완료
    Steps:
      1. cd packages/client/design-system && pnpm build-storybook
      2. ls storybook-static/index.html -- 빌드 결과물 존재 확인
    Expected Result: storybook-static/ 에 정상 빌드 산출물
    Evidence: .orchestrator/evidence/task-6-storybook-build.txt

  Scenario: Storybook 10 로컬 실행 (smoke test)
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. cd packages/client/design-system && timeout 30 pnpm storybook 2>&1 || true
      2. 출력에서 "Storybook ... started" 또는 포트 바인딩 메시지 확인
    Expected Result: Storybook dev server 정상 시작 (30초 내 초기화)
    Evidence: .orchestrator/evidence/task-6-storybook-dev.txt

  Scenario: DS 빌드/테스트 영향 없음
    Tool: Bash
    Steps:
      1. pnpm build:ds
      2. pnpm --filter design-system test
    Expected Result: Storybook 변경이 Vite 빌드/테스트에 영향 없음
    Evidence: .orchestrator/evidence/task-6-ds-intact.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): Storybook 10 + @chromatic-com/storybook 5 메이저 업그레이드`
  - Files: `packages/client/design-system/package.json`, `packages/client/design-system/.storybook/*`, `pnpm-lock.yaml`

---

- [ ] 7. ESLint 9 -> 10 + @eslint/js 9 -> 10 + globals 16 -> 17 메이저 업그레이드

  **What to do**:
  - **Root** (`/main/package.json`):
    - `eslint` ^9.28.0 -> ^10.0.0
    - `@eslint/js` ^9.28.0 -> ^10.0.0
    - `globals` ^16.5.0 -> ^17.0.0
  - `pnpm install` 실행
  - **Breaking Change 대응**:
    - ESLint 10 Flat Config 변경사항 확인
    - `eslint.config.mjs` 마이그레이션:
      - `tseslint.config()` API 호환성 확인
      - `globalIgnores()` import 경로 변경 여부 (`eslint/config` -> ?)
      - `globals.browser`, `globals.node` 객체 구조 변경 여부 (globals 17)
    - 플러그인 호환성:
      - `eslint-plugin-react-hooks` -- ESLint 10 호환 확인
      - `eslint-plugin-react-compiler` -- ESLint 10 호환 확인
      - `eslint-plugin-import` -- ESLint 10 호환 확인 (이 플러그인은 ESLint 메이저에 민감)
      - `typescript-eslint` -- ESLint 10 호환 버전 확인
      - `eslint-import-resolver-typescript` -- 호환 확인
    - 새로운 rule defaults 변경으로 인한 lint 에러 대응

  **Must NOT do**:
  - lint rule 자체 변경 (호환성 대응만)
  - 하위 패키지의 ESLint 설정 변경 (root flat config만 관리)

  **Rollback Strategy**:
  ```bash
  # root package.json에서 eslint, @eslint/js, globals 버전 되돌리기
  pnpm add -D eslint@^9.28.0 @eslint/js@^9.28.0 globals@^16.5.0
  git checkout -- eslint.config.mjs
  ```

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: ESLint 메이저 업그레이드 + 다수 플러그인 호환성 확인 필요
  - **Skills**: [`frontend-code-quality`]
    - `frontend-code-quality`: ESLint 설정 마이그레이션

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 7)
  - **Blocks**: T8
  - **Blocked By**: T6

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/eslint.config.mjs` -- 현재 ESLint Flat Config (전체 내용 참조 필수)
  - **API/Type References**:
    - `/Users/JuChan/Documents/FE/missionary/main/package.json` -- root devDependencies
  - **External References**:
    - https://eslint.org/blog -- ESLint 10 release blog
    - https://typescript-eslint.io/blog -- typescript-eslint ESLint 10 호환 정보
    - https://github.com/import-js/eslint-plugin-import/releases -- eslint-plugin-import ESLint 10 지원 현황

  **Acceptance Criteria**:
  - [ ] `pnpm lint` PASS (또는 기존과 동일한 수준의 warning만)
  - [ ] `pnpm lint:all` PASS
  - [ ] `pnpm type-check` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: ESLint 10 lint 정상 실행
    Tool: Bash
    Preconditions: pnpm install 완료, eslint.config.mjs 마이그레이션 완료
    Steps:
      1. pnpm lint
      2. pnpm lint:all
    Expected Result: lint 에러 0 (또는 업그레이드 전과 동일한 warning 수준)
    Evidence: .orchestrator/evidence/task-7-eslint-lint.txt

  Scenario: ESLint 플러그인 호환성
    Tool: Bash
    Steps:
      1. pnpm lint 2>&1 | grep -i "error\|plugin\|cannot" -- 플러그인 로드 에러 없는지 확인
      2. pnpm lint 2>&1 | grep -i "deprecated" -- deprecated 경고 확인
    Expected Result: 플러그인 로드 에러 없음, critical deprecated 없음
    Evidence: .orchestrator/evidence/task-7-eslint-plugins.txt

  Scenario: ESLint 10 + typescript-eslint 호환성
    Tool: Bash
    Steps:
      1. pnpm lint -- 특히 .ts/.tsx 파일의 타입 기반 규칙 동작 확인
    Expected Result: typescript-eslint 규칙 정상 동작
    Evidence: .orchestrator/evidence/task-7-eslint-ts.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): ESLint 10 + @eslint/js 10 + globals 17 메이저 업그레이드`
  - Files: `package.json`, `eslint.config.mjs`, `pnpm-lock.yaml`

- [ ] 8. TypeScript 5.9 -> 6.0 메이저 업그레이드

  **What to do**:
  - **Root** (`/main/package.json`):
    - `typescript` ^5.9.3 -> ^6.0.0
  - `pnpm install` 실행
  - **Breaking Change 대응 (핵심 -- TypeScript 메이저는 영향 범위 최대)**:
    - `tsconfig.json` 옵션 변경/deprecated 확인 (모든 패키지의 tsconfig)
    - 새로운 strictness 기본값 변경으로 인한 타입 에러 대응
    - `moduleResolution: bundler` (클라이언트) / `moduleResolution: node` (서버) 호환성 확인
    - 4개 패키지 모두에서 `pnpm type-check` 실행하여 에러 수집
    - 에러 유형별 분류 후 대응:
      - **타입 narrowing 변경**: 코드 수정 필요
      - **deprecated 옵션**: tsconfig 수정 필요
      - **새로운 strict 규칙**: 규칙 끄거나 코드 수정
    - `typescript-eslint`이 TS 6.0을 지원하는지 확인 (Wave 7에서 이미 ^8.57로 업데이트됨)
    - `ts-jest` (서버) TS 6.0 호환 확인
    - `vite-plugin-dts` (DS) TS 6.0 호환 확인

  **Must NOT do**:
  - TypeScript strict 옵션을 느슨하게 변경하여 에러를 우회 (가급적 코드를 수정)
  - 하위 패키지의 tsconfig 구조를 근본적으로 변경

  **Rollback Strategy**:
  ```bash
  # TypeScript만 5.9로 되돌리기
  pnpm add -D typescript@^5.9.3
  # tsconfig 변경사항 되돌리기
  git checkout -- **/tsconfig*.json
  ```

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: TypeScript 메이저 업그레이드는 모노레포 전체에 영향, 타입 에러 분석/수정에 높은 추론 능력 필요
  - **Skills**: [`frontend-code-quality`]
    - `frontend-code-quality`: 타입 시스템 변경 분석

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 8)
  - **Blocks**: T9 (Final Verification)
  - **Blocked By**: T7

  **References**:
  - **Pattern References**:
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/design-system/tsconfig.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-app/tsconfig.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/client/missionary-admin/tsconfig.json`
    - `/Users/JuChan/Documents/FE/missionary/main/packages/server/missionary-server/tsconfig.json`
  - **API/Type References**: `/Users/JuChan/Documents/FE/missionary/main/package.json` -- root typescript version
  - **External References**:
    - https://devblogs.microsoft.com/typescript/ -- TypeScript 6.0 announcement
    - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html -- breaking changes 상세

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` PASS (전체 4개 패키지)
  - [ ] `pnpm lint:all` PASS
  - [ ] `pnpm build:ds` PASS
  - [ ] `pnpm build:admin` PASS
  - [ ] `pnpm build:app` PASS
  - [ ] `pnpm --filter design-system test` PASS
  - [ ] `pnpm --filter missionary-app test:run` PASS
  - [ ] `pnpm --filter missionary-admin test` PASS
  - [ ] `pnpm --filter missionary-server test` PASS
  - [ ] `pnpm --filter missionary-server build` PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript 6.0 전체 타입 체크
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm type-check
      2. 에러 발생 시 에러 내용 기록 및 분류
    Expected Result: 0 errors
    Evidence: .orchestrator/evidence/task-8-typecheck.txt

  Scenario: TypeScript 6.0 전체 빌드 체인
    Tool: Bash
    Steps:
      1. pnpm build:ds
      2. pnpm build:admin
      3. pnpm build:app
      4. pnpm --filter missionary-server build
    Expected Result: 모든 빌드 성공
    Evidence: .orchestrator/evidence/task-8-builds.txt

  Scenario: TypeScript 6.0 전체 테스트
    Tool: Bash
    Steps:
      1. pnpm --filter design-system test
      2. pnpm --filter missionary-app test:run
      3. pnpm --filter missionary-admin test
      4. pnpm --filter missionary-server test
    Expected Result: 모든 테스트 통과
    Evidence: .orchestrator/evidence/task-8-tests.txt

  Scenario: ts-jest + vite-plugin-dts TS 6.0 호환
    Tool: Bash
    Steps:
      1. pnpm --filter missionary-server test -- ts-jest가 TS 6.0에서 동작하는지 확인
      2. pnpm build:ds -- vite-plugin-dts가 TS 6.0에서 .d.ts 생성하는지 확인
      3. ls packages/client/design-system/dist/index.d.ts -- d.ts 존재 확인
    Expected Result: 두 도구 모두 TS 6.0 호환
    Evidence: .orchestrator/evidence/task-8-tool-compat.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): TypeScript 6.0 메이저 업그레이드`
  - Files: `package.json`, `pnpm-lock.yaml`, (필요 시) `**/tsconfig*.json`, (타입 에러 수정된 .ts/.tsx 파일들)

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** -- `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** -- `unspecified-high`
  Run `pnpm type-check` + `pnpm lint:all` + all tests. Review all changed `package.json` files for version consistency. Check no `@types/node` 25 was introduced.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Full Integration QA** -- `unspecified-high`
  Execute all build commands sequentially: `pnpm build:ds` -> `pnpm build:admin` -> `pnpm build:app`. Run all test suites. Verify lockfile integrity with `pnpm install --frozen-lockfile`.
  Output: `Builds [N/N pass] | Tests [N/N pass] | Lockfile [CLEAN/DIRTY] | VERDICT`

- [ ] F4. **Scope Fidelity Check** -- `deep`
  For each Wave: verify only intended packages were modified. Check no unintended version changes. Verify `@types/node` remains at ^22. Verify commit messages follow convention.
  Output: `Waves [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 0**: (no commit -- branch setup only)
- **Wave 1**: `chore(deps): root 마이너/패치 의존성 업데이트` + `chore(deps): 클라이언트 마이너/패치 의존성 업데이트` + `chore(deps): 서버 마이너/패치 의존성 업데이트`
- **Wave 2**: `chore(deps): design-system vitest 4.x 메이저 업그레이드`
- **Wave 3**: `chore(deps): Vite 8 + @vitejs/plugin-react 6 메이저 업그레이드`
- **Wave 4**: `chore(deps): jsdom 29 메이저 업그레이드`
- **Wave 5**: `chore(deps): lucide-react 1.x 메이저 업그레이드`
- **Wave 6**: `chore(deps): Storybook 10 메이저 업그레이드`
- **Wave 7**: `chore(deps): ESLint 10 + globals 17 메이저 업그레이드`
- **Wave 8**: `chore(deps): TypeScript 6.0 메이저 업그레이드`

---

## Success Criteria

### Verification Commands
```bash
pnpm type-check          # Expected: 0 errors
pnpm lint:all            # Expected: 0 errors
pnpm build:ds            # Expected: build success
pnpm build:admin         # Expected: build success
pnpm build:app           # Expected: build success
pnpm --filter design-system test        # Expected: all pass
pnpm --filter missionary-app test:run   # Expected: all pass
pnpm --filter missionary-admin test     # Expected: all pass
pnpm --filter missionary-server test    # Expected: all pass
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] All builds succeed
- [ ] Lockfile consistent (`pnpm install --frozen-lockfile` passes)
- [ ] `@types/node` remains at ^22
- [ ] Each Wave has independent commit for rollback capability
