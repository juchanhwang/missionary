# missionary-admin Vercel Staging 배포

## TL;DR

> **Quick Summary**: missionary-admin(Next.js 16) 앱을 Vercel에 staging 환경으로 배포한다. Vercel Git Integration으로 dev 브랜치 push 시 자동 배포를 구성한다.
>
> **Deliverables**:
>
> - Vercel 프로젝트 생성 및 구성 (모노레포 설정)
> - 환경변수 설정 (NEXT_PUBLIC_API_URL)
> - 첫 배포 성공 및 접근 가능 확인
>
> **Estimated Effort**: Quick (1시간 이내)
> **Parallel Execution**: NO — sequential (3 tasks, 순서 의존)
> **Critical Path**: Task 1 (Vercel 프로젝트 설정) → Task 2 (첫 배포 및 검증) → Task 3 (자동 배포 확인)

---

## Context

### Original Request

missionary-admin을 배포한다.

### Interview Summary

**Key Discussions**:

- 플랫폼: Vercel (계정 이미 존재)
- 환경: Staging만 우선. Production은 서비스 실사용 시 추가
- 트리거: dev 브랜치 push 시 자동 배포 (Vercel Git Integration)
- 도메인: Vercel 기본 도메인 (xxx.vercel.app) 사용
- 백엔드: 아직 미배포. NEXT_PUBLIC_API_URL은 placeholder 설정

**Research Findings**:

- **design-system `dist/` 미커밋 (CRITICAL)**: `@samilhero/design-system` JS imports는 `dist/index.js`를 참조하지만 `dist/`는 git에 커밋되지 않음. Vercel 빌드 시 design-system을 먼저 빌드해야 함
- **CSS 상대경로 import**: `tailwind.css`에서 `../../../design-system/src/styles/theme.css`, `layout.tsx`에서 `../../../design-system/src/components/date-picker/DatePickerStyles.css` — design-system `src/` 디렉토리도 접근 필요
- `next.config.js`는 빈 설정 (`{}`)
- 환경변수: `NEXT_PUBLIC_API_URL` 1개만 필요
- `.npmrc`: `shamefully-hoist=true`, `node-linker=hoisted` — Vercel pnpm 호환
- `tsconfig.json`이 `../../../tsconfig.base.json` 상대 경로로 extends — monorepo root 필요
- `packageManager: pnpm@10.28.1` — Vercel이 corepack으로 자동 감지

### Metis Review

**Identified Gaps** (addressed):

- design-system 빌드 순서: 커스텀 빌드 명령어로 DS → admin 순서 빌드
- Root Directory 설정 시 빌드 명령어 경로: `cd ../../..`으로 monorepo root로 이동 후 pnpm --filter 실행
- Node.js 버전 미고정: Vercel 프로젝트 설정에서 20.x 고정
- NEXT*PUBLIC*\* 빌드타임 인라인: 환경변수 변경 시 재빌드 필요 — 문서화

---

## Work Objectives

### Core Objective

missionary-admin을 Vercel staging에 배포하고, dev 브랜치 push 시 자동 배포되는 파이프라인을 구성한다.

### Concrete Deliverables

- Vercel 프로젝트: GitHub 레포 연동, monorepo 설정 완료
- 환경변수: `NEXT_PUBLIC_API_URL` 설정
- 배포 URL: `https://<project-name>.vercel.app` 에서 앱 접근 가능
- 자동 배포: dev 브랜치 push 시 배포 트리거 확인

### Definition of Done

- [ ] Vercel에서 missionary-admin 빌드 성공 (design-system → admin 순서)
- [ ] `https://<project-name>.vercel.app` 접근 시 HTTP 200 응답
- [ ] dev 브랜치 push 시 자동 배포 트리거

### Must Have

- Vercel Root Directory: `packages/client/missionary-admin`
- 커스텀 빌드 명령어: design-system 먼저 빌드 후 admin 빌드
- 환경변수 `NEXT_PUBLIC_API_URL` 설정 (placeholder)
- dev 브랜치를 Vercel Production Branch로 설정
- Node.js 20.x 고정

### Must NOT Have (Guardrails)

- ❌ missionary-app 배포 설정 (별도 Vercel 프로젝트로 나중에)
- ❌ Production 환경 구성 (나중에)
- ❌ 커스텀 도메인 설정
- ❌ 소스코드 수정 (`next.config.js`, 컴포넌트 등 일체 수정 금지)
- ❌ `vercel.json` 추가 (Vercel Dashboard에서 프로젝트별 설정 — missionary-app 배포 시 충돌 방지)
- ❌ CI 워크플로우(`.github/workflows/ci.yaml`) 수정
- ❌ Vercel CLI를 프로젝트 의존성에 추가

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (vitest)
- **Automated tests**: NO (배포 인프라 설정 작업이므로 단위 테스트 대상 아님)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> 배포 설정 작업이므로 QA는 주로 Vercel CLI + curl로 검증합니다.

**Verification Tool by Deliverable Type:**

| Type                 | Tool                        | How Agent Verifies           |
| -------------------- | --------------------------- | ---------------------------- |
| Vercel 프로젝트 설정 | Bash (vercel CLI)           | `vercel ls`, `vercel env ls` |
| 배포 성공            | Bash (curl)                 | HTTP 상태 코드 확인          |
| 자동 배포            | Bash (git push + vercel ls) | 배포 트리거 확인             |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1: Task 1 (Vercel 프로젝트 생성 및 설정)
Wave 2: Task 2 (첫 배포 및 검증) [depends: 1]
Wave 3: Task 3 (자동 배포 파이프라인 확인) [depends: 2]
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 2, 3   | None                 |
| 2    | 1          | 3      | None                 |
| 3    | 2          | None   | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents                    |
| ---- | ----- | ------------------------------------- |
| 1    | 1     | task(category="unspecified-low", ...) |
| 2    | 2     | task(category="unspecified-low", ...) |
| 3    | 3     | task(category="quick", ...)           |

---

## TODOs

- [ ] 1. Vercel 프로젝트 생성 및 설정

  **What to do**:
  - Vercel CLI로 프로젝트 생성 및 GitHub 레포 연동
    1. `npx vercel login` (이미 로그인된 경우 스킵)
    2. `npx vercel link` — 기존 프로젝트 연결 또는 새 프로젝트 생성
       - GitHub 레포 연동
       - Framework: Next.js (auto-detect)
  - Vercel Dashboard 또는 CLI로 프로젝트 설정:
    - **Root Directory**: `packages/client/missionary-admin`
    - **Build Command** (Override):
      ```
      cd ../../.. && pnpm --filter @samilhero/design-system build && pnpm --filter missionary-admin build
      ```
      > Root Directory가 `packages/client/missionary-admin`으로 설정되면 빌드 명령어는 해당 디렉토리에서 실행됨.
      > `cd ../../..`으로 monorepo root로 이동 후 pnpm workspace --filter 사용.
      > design-system `dist/`가 git에 미커밋이므로 반드시 DS를 먼저 빌드해야 함.
    - **Install Command**: `pnpm install` (auto-detect 가능하나 명시적 설정 권장)
    - **Output Directory**: `.next` (기본값, 변경 불필요)
    - **Node.js Version**: 20.x (Project Settings → General → Node.js Version)
    - **Production Branch**: `dev` (staging만 운영하므로 dev를 Production Branch로 설정)
  - 환경변수 설정:
    - `NEXT_PUBLIC_API_URL` = `https://api.placeholder.local` (placeholder)
    - Environment: Production + Preview 모두 적용
      > `NEXT_PUBLIC_*` 변수는 빌드타임에 인라인됨. 백엔드 배포 후 실제 URL로 변경 시 재빌드 필요.

  **Must NOT do**:
  - `vercel.json` 파일을 레포에 추가하지 않음 (Dashboard에서 설정)
  - missionary-app용 프로젝트를 함께 생성하지 않음
  - 소스코드를 수정하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Vercel CLI/Dashboard 설정 작업. 표준적 인프라 구성
  - **Skills**: []
    - Vercel 설정은 특정 프레임워크 전문성 불필요
  - **Skills Evaluated but Omitted**:
    - `nestjs-expert`: 프론트엔드 배포와 무관
    - `frontend-ui-ux`: UI 작업 없음

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential start)
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `packages/client/missionary-admin/package.json` — 빌드 스크립트: `"build": "next build"`. Vercel이 이를 감지하나 커스텀 빌드 명령어로 override
  - `packages/client/design-system/package.json` — DS 빌드 스크립트: `"build": "vite build"`. DS → admin 빌드 순서의 근거
  - `packages/client/design-system/package.json:6-15` — `exports` 필드: `"./": { "import": "./dist/index.js" }`. admin이 `@samilhero/design-system` import 시 `dist/` 필요 → DS 빌드 필수

  **API/Type References**:
  - `packages/client/missionary-admin/.env.example` — 환경변수 목록 (`NEXT_PUBLIC_API_URL`)
  - `packages/client/missionary-admin/tsconfig.json` — `"extends": "../../../tsconfig.base.json"`. monorepo root 접근이 필요한 이유

  **Documentation References**:
  - `packages/client/CLAUDE.md` — Path alias: `"@*" → "../design-system/src/*"`. DS src 접근 패턴

  **WHY Each Reference Matters**:
  - `design-system/package.json`: exports가 `dist/`를 가리키므로 Vercel 빌드 전 DS 빌드가 필수. 이것이 커스텀 빌드 명령어의 핵심 이유
  - `missionary-admin/.env.example`: Vercel에 설정할 환경변수 목록의 근거
  - `tsconfig.json`: monorepo root의 tsconfig.base.json을 extends하므로 Vercel이 repo root에서 install해야 함 (Root Directory와 Install Directory가 다를 수 있음)
  - `.npmrc` (root): `shamefully-hoist=true` — pnpm hoisting 설정이 Vercel에서도 동작해야 함

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Vercel 프로젝트 존재 확인
    Tool: Bash (vercel CLI)
    Preconditions: vercel CLI 접근 가능, 로그인 완료
    Steps:
      1. npx vercel ls 2>&1
      2. Assert: 출력에 프로젝트명 포함 (missionary-admin 관련)
    Expected Result: Vercel 프로젝트가 목록에 존재
    Evidence: vercel ls 출력 캡처

  Scenario: 환경변수 설정 확인
    Tool: Bash (vercel CLI)
    Preconditions: Vercel 프로젝트 연결됨
    Steps:
      1. npx vercel env ls 2>&1
      2. Assert: "NEXT_PUBLIC_API_URL" 포함
    Expected Result: 환경변수가 Vercel에 등록됨
    Evidence: vercel env ls 출력 캡처

  Scenario: 로컬 빌드 시뮬레이션 (커스텀 빌드 명령어 검증)
    Tool: Bash
    Preconditions: pnpm 의존성 설치됨
    Steps:
      1. pnpm --filter @samilhero/design-system build
      2. Assert: exit code 0
      3. Assert: packages/client/design-system/dist/index.js 존재
      4. pnpm --filter missionary-admin build
      5. Assert: exit code 0
      6. Assert: packages/client/missionary-admin/.next/ 디렉토리 존재
    Expected Result: DS → admin 순서 빌드 성공 (Vercel에서도 동일하게 동작)
    Evidence: 빌드 출력 캡처 → .sisyphus/evidence/task-1-local-build.log
  ```

  **Evidence to Capture:**
  - [ ] vercel ls 출력: `.sisyphus/evidence/task-1-vercel-ls.txt`
  - [ ] vercel env ls 출력: `.sisyphus/evidence/task-1-vercel-env.txt`
  - [ ] 로컬 빌드 로그: `.sisyphus/evidence/task-1-local-build.log`

  **Commit**: NO (코드 변경 없음 — Vercel Dashboard/CLI 설정만)

---

- [ ] 2. 첫 배포 트리거 및 검증

  **What to do**:
  - Vercel에서 첫 배포 트리거:
    - 방법 A: Vercel Dashboard에서 "Redeploy" 클릭 (Git Integration 연결 후 자동 시작될 수도 있음)
    - 방법 B: `npx vercel --prod` 로 CLI에서 수동 배포
    - 방법 C: dev 브랜치에 trivial commit push
  - 배포 상태 모니터링:
    - Vercel Dashboard에서 빌드 로그 확인 또는 `npx vercel inspect <deployment-url>`
    - 빌드 실패 시 원인 분석 및 설정 수정
  - 배포 완료 후 검증:
    - 배포 URL 접근 가능 확인 (HTTP 200)
    - 페이지 렌더링 확인 (HTML 응답에 앱 콘텐츠 포함)
  - **빌드 실패 대응 가이드** (예상 실패 시나리오):
    - DS `dist/` 미빌드 → 커스텀 빌드 명령어 확인
    - pnpm workspace 해석 실패 → Install Command가 repo root에서 실행되는지 확인
    - Node.js 버전 불일치 → 20.x 설정 확인
    - 환경변수 누락 → Vercel env 설정 확인

  **Must NOT do**:
  - 빌드 실패를 소스코드 수정으로 해결하지 않음 (Vercel 설정으로만 해결)
  - 다른 브랜치를 배포하지 않음 (dev만)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 배포 트리거 + curl 검증. 표준적 DevOps 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - Task 1에서 설정한 Vercel 프로젝트 — 빌드 설정, 환경변수 등
  - `packages/client/missionary-admin/src/app/layout.tsx` — 루트 레이아웃. 빌드 성공 시 이 파일의 `<html lang="ko">` 등이 렌더링됨
  - `packages/client/missionary-admin/src/styles/tailwind.css:1-3` — `@import '../../../design-system/src/styles/theme.css'` + `@source "../../../design-system/src"`. 이 상대경로가 Vercel 빌드에서도 해결되는지 확인 포인트
  - `packages/client/missionary-admin/src/app/layout.tsx:2` — `import '../../../design-system/src/components/date-picker/DatePickerStyles.css'`. DS src 직접 import. Vercel 빌드 시 이 경로 존재 여부 확인 포인트

  **WHY Each Reference Matters**:
  - `layout.tsx`: 앱의 루트 파일. 빌드 성공의 최종 확인 대상
  - `tailwind.css`: DS src 상대경로 import가 Vercel 환경에서도 유효한지가 빌드 성패를 가름
  - `layout.tsx:2` DatePickerStyles: DS src 컴포넌트 CSS 직접 import — 빌드 시 src 접근 가능해야 함

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Vercel 배포 상태 확인
    Tool: Bash (vercel CLI)
    Preconditions: Task 1 완료, 배포 트리거됨
    Steps:
      1. npx vercel ls --limit=1 2>&1
      2. Assert: 최신 배포가 "Ready" 상태
      3. 배포 URL 추출 (출력에서 URL 파싱)
    Expected Result: 배포 성공 (Ready 상태)
    Evidence: vercel ls 출력 캡처

  Scenario: 배포된 앱 HTTP 응답 확인
    Tool: Bash (curl)
    Preconditions: 배포 성공 (Ready 상태)
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://<deployment-url>
      2. Assert: HTTP 200 (또는 307 → /login 리다이렉트)
      3. curl -s https://<deployment-url> | head -50
      4. Assert: HTML 응답에 "<html" 태그 포함
      5. Assert: HTML 응답에 "선교 상륙 작전" 포함 (metadata title)
    Expected Result: 앱이 정상 렌더링됨
    Evidence: curl 응답 캡처 → .sisyphus/evidence/task-2-curl-response.txt

  Scenario: 배포 빌드 로그 확인 (실패 시 디버깅용)
    Tool: Bash (vercel CLI)
    Preconditions: 배포 완료 (성공 또는 실패)
    Steps:
      1. npx vercel inspect <deployment-url> 2>&1
      2. 빌드 로그에서 "design-system" 빌드 관련 출력 확인
      3. 빌드 로그에서 에러 메시지 검색
    Expected Result: 빌드 로그에 DS → admin 순서 빌드 확인 가능
    Evidence: inspect 출력 캡처 → .sisyphus/evidence/task-2-build-log.txt
  ```

  **Evidence to Capture:**
  - [ ] 배포 상태: `.sisyphus/evidence/task-2-vercel-deploy.txt`
  - [ ] curl 응답: `.sisyphus/evidence/task-2-curl-response.txt`
  - [ ] 빌드 로그: `.sisyphus/evidence/task-2-build-log.txt`

  **Commit**: NO (코드 변경 없음)

---

- [ ] 3. 자동 배포 파이프라인 확인

  **What to do**:
  - dev 브랜치에 trivial commit push로 자동 배포 트리거 테스트
    1. 작은 변경 사항 (예: `README.md`에 공백 추가 또는 기존 pending 커밋 push)
    2. `git push origin dev`
    3. Vercel에서 새 배포가 자동 트리거되는지 확인
  - Preview 배포 확인 (선택):
    - feature 브랜치에서 PR 생성 시 Preview 배포가 동작하는지 확인
  - 배포 완료 후 이전 배포와 동일하게 접근 가능한지 확인

  **Must NOT do**:
  - 의미 있는 코드 변경을 하지 않음 (트리거 테스트 목적)
  - prod 브랜치에 push하지 않음

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: git push + vercel ls 확인. 단순 검증 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Final)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - Task 1에서 설정한 Production Branch (`dev`) — 이 브랜치에 push 시 배포 트리거
  - `.github/workflows/ci.yaml` — 기존 CI는 PR to dev 트리거. Vercel 배포는 push to dev 트리거. 두 파이프라인이 독립적으로 동작해야 함

  **WHY Each Reference Matters**:
  - Production Branch 설정: Vercel이 이 브랜치의 push를 감지하여 Production 배포를 트리거
  - `ci.yaml`: CI와 Vercel 배포가 충돌하지 않는지 확인 (CI는 PR, Vercel은 push)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: dev 브랜치 push 후 자동 배포 트리거 확인
    Tool: Bash (git + vercel CLI)
    Preconditions: Task 2 완료, Vercel Git Integration 활성화
    Steps:
      1. 현재 배포 목록 확인: npx vercel ls --limit=1 2>&1 (타임스탬프 기록)
      2. dev 브랜치에 trivial commit push (또는 기존 커밋 push)
      3. 30초 대기 (Vercel webhook 처리 시간)
      4. npx vercel ls --limit=1 2>&1
      5. Assert: 새 배포가 생성됨 (타임스탬프가 Step 1보다 최신)
      6. 배포 완료까지 대기 (최대 5분, 10초 간격으로 polling)
      7. Assert: 배포 상태 "Ready"
    Expected Result: dev 브랜치 push → Vercel 자동 배포 성공
    Evidence: vercel ls 출력 (before/after) 캡처

  Scenario: 자동 배포된 앱 정상 접근 확인
    Tool: Bash (curl)
    Preconditions: 자동 배포 완료
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://<deployment-url>
      2. Assert: HTTP 200 (또는 307)
    Expected Result: 자동 배포된 앱 정상 동작
    Evidence: curl 응답 캡처 → .sisyphus/evidence/task-3-auto-deploy.txt
  ```

  **Evidence to Capture:**
  - [ ] 배포 트리거 확인: `.sisyphus/evidence/task-3-auto-deploy.txt`

  **Commit**: NO (또는 트리거용 trivial commit만 — 이 경우 `chore: Vercel 자동 배포 트리거 테스트`)

---

## Commit Strategy

| After Task | Message                                        | Files               | Verification      |
| ---------- | ---------------------------------------------- | ------------------- | ----------------- |
| 1          | — (코드 변경 없음)                             | —                   | vercel ls         |
| 2          | — (코드 변경 없음)                             | —                   | curl HTTP 200     |
| 3          | (선택) `chore: Vercel 자동 배포 트리거 테스트` | README.md (trivial) | vercel ls 새 배포 |

---

## Success Criteria

### Verification Commands

```bash
# 1. Vercel 프로젝트 존재
npx vercel ls 2>&1
# Expected: 프로젝트명 출력, 최소 1개 배포 Ready 상태

# 2. 환경변수 등록
npx vercel env ls 2>&1
# Expected: NEXT_PUBLIC_API_URL 존재

# 3. 배포 URL 접근
curl -s -o /dev/null -w "%{http_code}" https://<deployment-url>
# Expected: 200 또는 307

# 4. HTML 렌더링 확인
curl -s https://<deployment-url> | grep "선교 상륙 작전"
# Expected: title 매치
```

### Final Checklist

- [ ] Vercel 프로젝트가 GitHub 레포에 연동됨
- [ ] Root Directory가 `packages/client/missionary-admin`으로 설정됨
- [ ] 커스텀 빌드 명령어가 DS → admin 순서로 빌드
- [ ] Node.js 20.x로 고정
- [ ] dev 브랜치가 Production Branch로 설정됨
- [ ] `NEXT_PUBLIC_API_URL` 환경변수 등록됨
- [ ] 첫 배포 성공 (Ready 상태)
- [ ] 배포 URL에서 앱 접근 가능 (HTTP 200)
- [ ] dev push 시 자동 배포 트리거됨
- [ ] 소스코드 변경 없음
