# 디자인 시스템 리팩토링 — Shadcn/ui 스타일 모던화

## TL;DR

> **Quick Summary**: 22개 디자인 시스템 컴포넌트를 Shadcn/ui 스타일로 전면 리팩토링한다. `cva` + `cn()` 패턴을 도입하고, 깨진 UI(Button 패딩/사이즈, Select 무스타일, Input 고정너비)를 수정하며, 모든 컴포넌트에 focus ring · transition · disabled 상태를 추가한다.
>
> **Deliverables**:
>
> - `cn()` 유틸리티 + `cva` 기반 variant 시스템으로 전면 마이그레이션
> - 22개 컴포넌트 스타일링 현대화 (패딩, 사이즈, 포커스, 트랜지션, 상태)
> - missionary-admin 소비 코드 업데이트 (15개 파일)
> - 주요 컴포넌트 vitest 테스트 추가 (~20개 신규) + 기존 23개 테스트 업데이트
> - Storybook 스토리 전체 검수
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 8

---

## Context

### Original Request

디자인 시스템 전체 리팩토링. 깨진 UI 수정, 모던한 스타일 적용. Button 패딩/사이즈 등 어색한 요소 수정. 속성 추가/수정/삭제 허용.

### Interview Summary

**Key Discussions**:

- **참고 디자인 시스템**: Shadcn/ui
- **우선순위**: Button이 가장 심각, 나머지는 내 판단으로
- **테스트 전략**: 주요 컴포넌트에 테스트 추가 + 기존 테스트 업데이트
- **범위**: 전체 22개 컴포넌트 (사용 중인 8개 우선)

**Research Findings**:

- 디자인 시스템 위치: `/packages/client/design-system/`
- 스타일링: Tailwind CSS 4 + SCSS (typography만)
- 빌드: Vite + vitest (기존 23개 테스트 통과)
- missionary-admin만 소비 (15파일, 8컴포넌트), missionary-app은 shell 상태
- Select에 TODO "아직 작업 중인 컴포넌트" + Story 타입 에러 존재

### Metis Review

**Identified Gaps** (addressed):

- `cva` + `cn()` 도입 여부 → **채택** (Shadcn 핵심 패턴)
- `classnames` → `cn()` 마이그레이션 전략 → Task 1에서 일괄 처리
- Button `width` prop 처리 → **제거**, admin에서 `className="w-[400px]"` 대체
- Select 리팩토링 깊이 → 스타일링 + Escape-to-close만, 전체 키보드 nav 제외
- Headless 컴포넌트(Checkbox/Radio/Switch) 비주얼 → 내장 기본 비주얼 추가, children 커스텀 유지
- RHF 호환성 보존 → 모든 변경 후 기존 23개 테스트 통과 필수
- MissionStatusBadge의 className override → `cn()` (tailwind-merge) 적용으로 안전

---

## Work Objectives

### Core Objective

22개 디자인 시스템 컴포넌트를 Shadcn/ui 스타일로 현대화하여, 깨진 UI를 수정하고 일관된 디자인 품질을 확보한다.

### Concrete Deliverables

- `src/lib/utils.ts` — `cn()` 유틸리티 함수
- 22개 컴포넌트 파일 — `cva` 기반 variant + 모던 스타일링
- 21개 스토리 파일 — 업데이트된 API 반영
- missionary-admin 15개 파일 — 변경된 API 적용
- ~20개 신규 테스트 (Button, InputField, Tab, Badge, IconButton)
- 기존 23개 테스트 — API 변경 반영

### Definition of Done

- [ ] `pnpm test` (design-system) — 43+ tests, 0 failures
- [ ] `pnpm build:ds` — exit 0, TypeScript 에러 없음
- [ ] `pnpm build:admin` — exit 0, TypeScript 에러 없음
- [ ] `pnpm type-check` — exit 0
- [ ] `pnpm lint:all` — exit 0
- [ ] `pnpm sb:ds` — Storybook 실행, 모든 스토리 렌더링 정상

### Must Have

- 모든 컴포넌트에 focus-visible ring
- 모든 인터랙티브 컴포넌트에 transition 효과
- 모든 disabled 상태에 cursor-not-allowed + opacity
- Button에 사이즈별 padding + font-size
- Select에 최소한의 스타일링 (Trigger, Options, Option)
- `cn()` 유틸리티 전체 적용

### Must NOT Have (Guardrails)

- `@radix-ui/*` 의존성 추가 금지 — 기존 커스텀 구현 유지
- `theme.css` 색상 토큰 이름/값 변경 금지 — 새 토큰 추가만 허용
- `_typography.scss` 수정 금지 — 디자인팀 협의 대상
- `components/index.tsx` 기존 export 삭제 금지 — 추가만 허용
- Select 전체 키보드 내비게이션 (arrow up/down, type-ahead) — 이번 범위 외
- Checkbox/Radio/Switch의 RHF 통합 동작 변경 금지 (hidden input + div click 패턴 유지)
- 스냅샷 테스트 또는 비주얼 리그레션 테스트 추가 금지
- Storybook MDX 문서 페이지 작성 금지

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> **ALL verification is executed by the agent** using tools (Playwright, Bash, etc.).

### Test Decision

- **Infrastructure exists**: YES (vitest + @testing-library/react + @testing-library/user-event)
- **Automated tests**: Tests-after (각 컴포넌트 리팩토링 후 테스트 작성/수정)
- **Framework**: vitest

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type                  | Tool                          | How Agent Verifies                                      |
| --------------------- | ----------------------------- | ------------------------------------------------------- |
| **컴포넌트 스타일링** | Playwright (playwright skill) | Storybook 열고, 각 스토리 탐색, DOM 속성 검증, 스크린샷 |
| **빌드/타입**         | Bash                          | `pnpm build:ds`, `pnpm build:admin`, `pnpm type-check`  |
| **테스트**            | Bash                          | `pnpm test` in design-system                            |
| **린트**              | Bash                          | `pnpm lint:all`                                         |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Infrastructure (cva, cn(), classnames 마이그레이션)

Wave 2 (After Wave 1):
├── Task 2: Button 리팩토링 + admin 업데이트 [가장 먼저 시작]
├── Task 3: Select 리팩토링 + admin 업데이트
└── Task 4: Input 패밀리 (Input, InputField, DatePicker, SearchBox) 개선

Wave 3 (After Wave 2):
├── Task 5: Badge + IconButton + Chips 현대화
├── Task 6: Form Controls (Checkbox, Radio, Switch, Groups) 비주얼 추가
└── Task 7: 나머지 컴포넌트 (Tab, Tooltip, NavItem, Pagination, Divider, Text, TopButton)

Wave 4 (After Wave 3):
└── Task 8: 스토리 검수 + 신규 테스트 + 최종 검증
```

### Dependency Matrix

| Task | Depends On       | Blocks           | Can Parallelize With  |
| ---- | ---------------- | ---------------- | --------------------- |
| 1    | None             | 2, 3, 4, 5, 6, 7 | None (infrastructure) |
| 2    | 1                | 8                | 3, 4                  |
| 3    | 1                | 8                | 2, 4                  |
| 4    | 1                | 8                | 2, 3                  |
| 5    | 1                | 8                | 6, 7                  |
| 6    | 1                | 8                | 5, 7                  |
| 7    | 1                | 8                | 5, 6                  |
| 8    | 2, 3, 4, 5, 6, 7 | None (final)     | None                  |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                                                               |
| ---- | ------- | -------------------------------------------------------------------------------- |
| 1    | 1       | `task(category="quick", load_skills=["frontend-ui-ux"])`                         |
| 2    | 2, 3, 4 | `task(category="visual-engineering", load_skills=["frontend-ui-ux"])` — 3개 병렬 |
| 3    | 5, 6, 7 | `task(category="visual-engineering", load_skills=["frontend-ui-ux"])` — 3개 병렬 |
| 4    | 8       | `task(category="unspecified-high", load_skills=["playwright"])`                  |

---

## TODOs

- [x] 1. Infrastructure — `cva` + `cn()` 도입 및 `classnames` 마이그레이션

  **What to do**:
  - `pnpm add class-variance-authority clsx tailwind-merge --filter @samilhero/design-system` 실행
  - `src/lib/utils.ts` 파일 생성:

    ```ts
    import { type ClassValue, clsx } from 'clsx';
    import { twMerge } from 'tailwind-merge';

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```

  - `src/index.tsx`에 `export { cn } from './lib/utils';` 추가
  - 모든 컴포넌트 파일에서 `import classnames from 'classnames'` → `import { cn } from '@lib/utils'` 교체
  - 모든 `classnames(...)` 호출을 `cn(...)` 으로 교체 (동작은 동일, classnames의 object syntax `{ 'class': boolean }` 도 clsx가 지원)
  - `pnpm remove classnames --filter @samilhero/design-system`
  - `tsconfig.json`의 `paths`에 `@lib/*` alias 추가 (현재 `@*: ["./*"]` 이므로 이미 `@lib/utils`로 접근 가능한지 확인, 안 되면 추가)

  **Must NOT do**:
  - 이 태스크에서 컴포넌트 스타일링을 변경하면 안 됨 — 오직 `classnames` → `cn()` 1:1 교체만
  - `cva`를 아직 적용하지 않음 — 각 컴포넌트 태스크에서 적용

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 기계적 교체 작업으로 복잡한 설계 판단 불필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 프론트엔드 패키지 구조 이해에 필요

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (단독)
  - **Blocks**: Tasks 2, 3, 4, 5, 6, 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/button/index.tsx` — 현재 `classnames` import 및 사용 패턴. 이 패턴이 모든 컴포넌트에 동일하게 적용되어 있으므로, 교체 범위 파악용
  - `packages/client/design-system/src/index.tsx` — 메인 barrel export. 여기에 `cn` export 추가 필요
  - `packages/client/design-system/src/components/index.tsx` — 컴포넌트 barrel export. cn은 여기가 아닌 lib에서 export

  **API/Type References**:
  - `packages/client/design-system/package.json` — 현재 의존성 목록. `classnames` 제거, `class-variance-authority` + `clsx` + `tailwind-merge` 추가 대상
  - `packages/client/design-system/tsconfig.json` — path alias 설정. `@lib/*` 또는 `@*` 매핑 확인

  **External References**:
  - Shadcn/ui `cn()` 구현: `import { clsx, type ClassValue } from "clsx"; import { twMerge } from "tailwind-merge"; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`

  **WHY Each Reference Matters**:
  - `button/index.tsx`: 교체할 패턴의 대표 예시 — `classnames(...)` 호출 형태 확인
  - `package.json`: 의존성 추가/삭제 대상
  - `tsconfig.json`: `@lib/utils` import가 올바르게 resolve 되는지 확인

  **Acceptance Criteria**:
  - [ ] `class-variance-authority`, `clsx`, `tailwind-merge` 가 design-system의 dependencies에 존재
  - [ ] `classnames` 가 design-system의 dependencies에서 제거됨
  - [ ] `src/lib/utils.ts` 파일 존재, `cn` 함수 export
  - [ ] 모든 컴포넌트 파일에서 `classnames` import 없음 (검증: `grep -r "classnames" src/components/` → 0 결과)
  - [ ] `pnpm test` (design-system) — 23/23 pass, exit 0
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: cn() 함수가 classnames과 동일하게 동작
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. pnpm build:ds
      2. Assert: exit code 0, no TypeScript errors
      3. pnpm test (in design-system directory)
      4. Assert: 23 tests pass, 0 failures
      5. grep -r "from 'classnames'" packages/client/design-system/src/
      6. Assert: 0 matches (완전히 제거됨)
    Expected Result: 빌드 성공, 모든 기존 테스트 통과, classnames 흔적 없음
    Evidence: Terminal output captured

  Scenario: tailwind-merge로 className override 정상 동작
    Tool: Bash
    Preconditions: cn() 유틸리티 생성 완료
    Steps:
      1. pnpm build:admin
      2. Assert: exit code 0
      3. pnpm type-check
      4. Assert: exit 0
    Expected Result: admin 빌드 정상, 타입 체크 통과
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `refactor(design-system): classnames를 cn(clsx+tailwind-merge)으로 마이그레이션`
  - Files: `packages/client/design-system/src/**`, `packages/client/design-system/package.json`
  - Pre-commit: `pnpm test --filter @samilhero/design-system`

---

- [x] 2. Button 완전 리팩토링 — Shadcn 스타일 + admin 소비 코드 업데이트

  **What to do**:
  - `cva`로 Button variant 시스템 재구축:
    - **variants**: `default`(=현재 filled/primary), `destructive`, `outline`, `secondary`(=현재 filled/secondary), `ghost`, `link`
    - **sizes**: `sm` (h-8 px-3 text-xs rounded-md), `md` (h-9 px-4 text-sm rounded-md), `lg` (h-10 px-6 text-base rounded-md), `xl` (h-12 px-8 text-base rounded-lg), `xxl` (h-14 px-8 text-base rounded-none) — xxl은 기존 xxlg의 rounded-none 보존
  - 모든 사이즈에 적절한 horizontal padding (`px-*`) 추가 — **현재 가장 심각한 문제**
  - 모든 사이즈에 font-size 분리 (현재 전체 `text-base` → 사이즈별 차등)
  - 공통 스타일 추가: `inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`
  - Shadcn 스타일 색상 매핑:
    - `default`: `bg-primary-80 text-white hover:bg-primary-70 active:bg-primary-90`
    - `destructive`: `bg-error-50 text-white hover:bg-error-60`
    - `outline`: `border border-gray-20 bg-white hover:bg-gray-02 text-gray-80`
    - `secondary`: `bg-secondary-50 text-white hover:bg-secondary-40 active:bg-secondary-70`
    - `ghost`: `hover:bg-gray-05 text-gray-70`
    - `link`: `text-primary-80 underline-offset-4 hover:underline`
  - `width` prop 제거 → admin에서 `className`으로 대체
  - `color` prop 제거 → `variant`로 통합 (primary→default, secondary→secondary)
  - `size` prop의 `xlg` → `xl`, `xxlg` → `xxl` 로 rename (간결화)
  - **focus ring 토큰 추가**: `theme.css`에 `--color-ring: var(--color-primary-50);` 추가 (기존 토큰 변경 아님, 추가)
  - **missionary-admin 소비 코드 업데이트** (9개 사용 지점):
    - `login/page.tsx`: `width={400}` → `className="w-[400px]"`, `color="primary"` 제거 (default)
    - `MissionForm.tsx`: `color="primary"` 제거, `className="w-full"` 유지
    - `MissionGroupForm.tsx`: 동일
    - `AsyncBoundary.tsx`: `size="sm"` 유지
    - `AuthErrorFallback.tsx`: `size="md"` → default이므로 prop 제거 가능
    - `DeleteMissionSection.tsx`: `color="secondary"` → `variant="secondary"`, custom bg-error className 유지
    - `DeleteConfirmModal.tsx`: 필요시 variant 변경
    - `(admin)/page.tsx`, `missions/page.tsx`, `missions/[groupId]/page.tsx`: 기본 사용 확인
  - Button 스토리 업데이트 — 모든 variant, 모든 size, disabled 상태 포함

  **Must NOT do**:
  - `theme.css` 기존 색상 토큰 값 변경 금지 (새 `--color-ring` 추가만)
  - `forwardRef` 사용 금지 (React 19 `ref` prop 패턴 유지)
  - 과도한 variant 추가 (6개면 충분)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 컴포넌트 스타일링 + 소비 코드 동시 수정이 핵심
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 시스템 컴포넌트 스타일링 전문성 필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4) — **이 태스크를 가장 먼저 시작**
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/button/index.tsx` — 현재 Button 전체 구현. sizeClasses에 px 없음, filledColorClasses/outlineClasses 분리된 구조, `text-base font-bold rounded-lg` 공통 클래스
  - `packages/client/design-system/src/components/button/index.stories.tsx` — 현재 스토리 구조. Filled, Outline, XXLarge, CustomColor 4개 스토리

  **API/Type References**:
  - `packages/client/design-system/src/styles/theme.css` — 색상 토큰 전체. primary-10~90, secondary-10~90, error-10~90 등. 여기에 `--color-ring` 추가
  - 현재 ButtonProps: `variant?: 'filled' | 'outline'`, `width?: CSS['width']`, `size?: 'sm'|'md'|'lg'|'xlg'|'xxlg'`, `color?: 'primary'|'secondary'`

  **Test References**:
  - 현재 Button 테스트 없음. 신규 작성 필요.
  - `packages/client/design-system/src/components/checkbox/__tests__/Checkbox.test.tsx` — 기존 테스트 패턴 참고 (testing-library + userEvent 사용법)

  **Documentation References**:
  - `packages/client/CLAUDE.md` — React 19 ref 패턴, Tailwind CSS 4 사용 규칙

  **External References**:
  - Shadcn/ui Button: `cva` 기반 variants(default/destructive/outline/secondary/ghost/link), sizes(default/sm/lg/icon). focus-visible:ring 패턴.

  **WHY Each Reference Matters**:
  - `button/index.tsx`: 현재 구조를 cva로 변환할 때 기존 variant/size 매핑이 필요
  - `theme.css`: 색상 토큰명을 Tailwind 클래스에서 사용. `bg-primary-80` 등의 정확한 매핑
  - admin 파일들: 각각 어떤 props를 사용하는지 정확히 알아야 breaking change 없이 마이그레이션

  **Acceptance Criteria**:
  - [ ] Button이 `cva` 기반 variant 시스템 사용
  - [ ] 모든 사이즈에 적절한 horizontal padding 존재 (sm: px-3, md: px-4, lg: px-6, xl: px-8, xxl: px-8)
  - [ ] 사이즈별 font-size 차등 적용 (sm: text-xs, md: text-sm, lg+: text-base)
  - [ ] 6개 variant 모두 동작: default, destructive, outline, secondary, ghost, link
  - [ ] focus-visible:ring 스타일 존재
  - [ ] transition-colors 클래스 존재
  - [ ] disabled 상태: pointer-events-none + opacity-50
  - [ ] `width` prop 제거됨
  - [ ] `color` prop 제거됨
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0 (소비 코드 업데이트 반영)
  - [ ] `pnpm test` — 기존 테스트 + Button 신규 테스트 통과

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Button 사이즈별 패딩과 폰트 크기 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook dev server running (pnpm sb:ds, port 6006)
    Steps:
      1. Navigate to: http://localhost:6006
      2. Navigate to Button story (Components/Button)
      3. 각 size variant 스토리로 이동
      4. button 요소의 computed style 확인:
         - sm: padding-left >= 12px, font-size = 12px (0.75rem)
         - md: padding-left >= 16px, font-size = 14px (0.875rem)
         - lg: padding-left >= 24px, font-size = 16px (1rem)
      5. Screenshot: .sisyphus/evidence/task-2-button-sizes.png
    Expected Result: 모든 사이즈에 눈에 보이는 좌우 패딩, 사이즈별 다른 폰트 크기
    Evidence: .sisyphus/evidence/task-2-button-sizes.png

  Scenario: Button variant별 스타일 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. 각 variant(default, destructive, outline, secondary, ghost, link) 스토리 탐색
      2. default: background-color가 primary 계열인지 확인
      3. outline: border 존재, background 투명/흰색
      4. ghost: background 투명, hover시 bg 변경
      5. Screenshot each: .sisyphus/evidence/task-2-button-variants.png
    Expected Result: 6개 variant 모두 시각적으로 구분 가능
    Evidence: .sisyphus/evidence/task-2-button-variants.png

  Scenario: Button disabled + focus 상태 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Disabled 스토리에서 button[disabled] 확인
      2. Assert: opacity < 1 (disabled:opacity-50)
      3. Assert: pointer-events: none 또는 cursor-not-allowed
      4. Tab 키로 enabled button에 포커스
      5. Assert: focus ring 시각적으로 표시됨
      6. Screenshot: .sisyphus/evidence/task-2-button-states.png
    Expected Result: disabled 버튼 흐리게 표시, 포커스 시 ring 표시
    Evidence: .sisyphus/evidence/task-2-button-states.png

  Scenario: Admin 빌드 정상 확인
    Tool: Bash
    Preconditions: Button API 변경 + admin 코드 업데이트 완료
    Steps:
      1. pnpm build:ds
      2. Assert: exit 0
      3. pnpm build:admin
      4. Assert: exit 0
      5. pnpm type-check
      6. Assert: exit 0
    Expected Result: 빌드 체인 전체 통과
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `design(design-system): Button Shadcn 스타일 리팩토링 및 cva 적용`
  - Files: `packages/client/design-system/src/components/button/`, `packages/client/design-system/src/styles/theme.css`, `packages/client/missionary-admin/src/**` (Button 사용처)
  - Pre-commit: `pnpm test --filter @samilhero/design-system && pnpm build:admin`

---

- [x] 3. Select 리팩토링 — 스타일링 + 타입 에러 수정

  **What to do**:
  - WIP TODO 주석 제거 (`// TODO: (주찬) 아직 작업 중인 컴포넌트입니다.`)
  - **SelectTrigger 스타일링 추가**:
    - `cn('flex h-12 w-full items-center justify-between rounded-lg border border-gray-20 bg-white px-4 py-2 text-sm transition-colors hover:border-gray-40 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)`
    - 열림 상태: `data-[state=open]:border-primary-50` 또는 open prop 기반 스타일
    - Chevron 아이콘 추가 (기존 NavItem의 SVG 패턴 활용)
    - placeholder 텍스트 스타일: `text-gray-30`
  - **SelectOptions 스타일링 추가**:
    - `cn('absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-10 bg-white py-1 shadow-lg', className)`
    - 스크롤 가능 영역
  - **SelectOption 스타일링 추가**:
    - `cn('relative flex cursor-pointer select-none items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-02 active:bg-gray-05', className)`
    - 선택된 항목 표시: `data-[selected]:bg-primary-10 data-[selected]:text-primary-80` 또는 context 기반
  - **Escape 키로 닫기**: SelectRoot에 `useEffect`로 Escape 키 리스너 추가
  - **Uncontrolled→Controlled 경고 수정**: `useControllableState` 초기값 처리 확인
  - **Story 타입 에러 수정**: `label` prop 참조 제거 (SelectRootProps에 없는 prop)
  - **Admin 소비 코드 확인**: `MissionGroupForm.tsx`의 Select 사용 — API 변경 없으면 수정 불필요

  **Must NOT do**:
  - 전체 키보드 내비게이션(arrow up/down, type-ahead, Home/End) 추가 금지 — 이번 범위 외
  - SelectSearchInput 기능 변경 금지
  - Select의 compound component API(Select.Trigger, Select.Options, Select.Option) 구조 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 compound component에 스타일링 추가가 핵심
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 드롭다운 UI 패턴과 스타일링 전문성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/select/index.tsx` — SelectRoot 전체. Context 기반 compound component. `useControllableState`로 값 관리. `handleClickOutside`로 외부 클릭 닫기.
  - `packages/client/design-system/src/components/select/Trigger.tsx` — 현재 bare `<button>` (스타일 없음)
  - `packages/client/design-system/src/components/select/SelectOptions.tsx` — 현재 bare `<ul>` (스타일 없음). `data.open` 조건부 렌더링.
  - `packages/client/design-system/src/components/select/SelectOption.tsx` — 현재 bare `<li>` (스타일 없음). `actions.handleSelectValue(item)` onClick.
  - `packages/client/design-system/src/components/nav-item/index.tsx:60-77` — Chevron SVG 아이콘 패턴. Trigger에 재사용 가능.

  **API/Type References**:
  - `SelectRootProps`: defaultValue, value, multiple, children, className, onChange, onBlur, name, ref — `label` prop 없음 (Story에서 잘못 사용)
  - `packages/client/missionary-admin/src/app/(admin)/missions/components/MissionGroupForm.tsx` — `<Select value={field.value} onChange={field.onChange}>` + `Select.Trigger disabled={isPending}` + `Select.Options` + `Select.Option item="DOMESTIC"`

  **Test References**:
  - `packages/client/design-system/src/components/select/__tests__/Select.test.tsx` — 기존 5개 테스트 (RHF 통합, open/close, 값 선택)

  **Acceptance Criteria**:
  - [ ] SelectTrigger에 시각적 스타일(border, padding, rounded, hover) 적용
  - [ ] SelectOptions에 드롭다운 스타일(shadow, border, max-height, overflow) 적용
  - [ ] SelectOption에 호버/선택 스타일 적용
  - [ ] Escape 키로 드롭다운 닫힘
  - [ ] Story 파일의 TypeScript 에러 0개
  - [ ] React uncontrolled→controlled 경고 없음 (테스트 실행 시)
  - [ ] WIP TODO 주석 제거됨
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0
  - [ ] 기존 Select 테스트 5개 통과

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Select 드롭다운 시각적 스타일 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running (port 6006)
    Steps:
      1. Navigate to Select story
      2. Click on Trigger 버튼
      3. Assert: Trigger에 border, rounded-lg 존재
      4. Assert: Options 드롭다운이 shadow 있는 패널로 표시
      5. Assert: 각 Option에 hover 시 배경색 변화
      6. Screenshot: .sisyphus/evidence/task-3-select-open.png
    Expected Result: 스타일링된 드롭다운 UI
    Evidence: .sisyphus/evidence/task-3-select-open.png

  Scenario: Escape 키로 닫기 + 기존 테스트 통과
    Tool: Bash
    Preconditions: 코드 변경 완료
    Steps:
      1. pnpm test --filter @samilhero/design-system
      2. Assert: Select 관련 5개 테스트 통과
      3. stderr에서 "uncontrolled" 문자열 검색
      4. Assert: 0 matches
    Expected Result: 기존 테스트 통과, 경고 없음
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `design(design-system): Select 컴포넌트 스타일링 추가 및 타입 에러 수정`
  - Files: `packages/client/design-system/src/components/select/`
  - Pre-commit: `pnpm test --filter @samilhero/design-system`

---

- [x] 4. Input 패밀리 개선 — Input, InputField, DatePicker, SearchBox

  **What to do**:
  - **Input 리팩토링** (가장 문제 많음):
    - 고정 `w-80` 제거 → `w-full` (부모에 따라 유연하게)
    - `inputType` prop → 제거 (InputHTMLAttributes에 이미 `type` 존재)
    - `value: string` (required) → optional로 변경 (uncontrolled 지원)
    - Reset 버튼: 값이 있을 때만 표시 (`hasValue && onReset`)
    - focus 상태: wrapper에 `focus-within:ring-1 focus-within:ring-ring focus-within:border-primary-50` 추가
    - disabled 상태: `disabled:cursor-not-allowed disabled:opacity-50`
    - transition 추가: `transition-colors`
    - 패딩 정리: 현재 `px-4 py-[13px]` → `px-3 py-2` (Shadcn input 패턴)
  - **InputField 폴리싱**:
    - focus ring 추가: wrapper에 `focus-within:ring-1 focus-within:ring-ring`
    - 패딩 간결화: `pt-[14px] pb-[14px] pl-4 pr-4` → `px-4 py-3.5` 또는 `px-3 py-2`
    - transition 추가
  - **DatePicker 폴리싱**:
    - InputField과 동일한 focus ring 추가
    - wrapper 패딩 간결화 (InputField과 일치시킴)
  - **SearchBox 폴리싱**:
    - focus ring 추가: `focus-within:ring-1 focus-within:ring-ring`
    - transition 추가
  - 각 컴포넌트 스토리 업데이트

  **Must NOT do**:
  - Input과 InputField 병합 금지 — 서로 다른 용도 (raw input vs labeled field)
  - DatePicker의 react-datepicker 의존성 변경 금지
  - InputField의 aria 속성 제거 금지 (이미 잘 되어있음)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 4개 폼 관련 컴포넌트의 일관된 스타일링 작업
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 폼 UI 패턴 스타일링

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/input/index.tsx` — 현재 Input. 고정 `w-80`, `inputType`, `value: string` (required). Reset 항상 표시.
  - `packages/client/design-system/src/components/input-field/index.tsx` — 현재 InputField. 이미 양호 (aria, label, error). focus ring만 추가.
  - `packages/client/design-system/src/components/date-picker/index.tsx` — DatePicker. InputField과 동일 wrapper 패턴. react-datepicker 래핑.
  - `packages/client/design-system/src/components/search-box/index.tsx` — SearchBox. 기본적 구현. focus ring 없음.

  **API/Type References**:
  - InputProps: `inputType?: string`, `value: string` (required), `error?: string`, `onReset?: () => void`
  - InputFieldProps: `label?`, `hideLabel?`, `error?`, `onClear?` — 이 API는 변경 없음
  - DatePickerProps: `label?`, `error?`, `selected?`, `value?`, `onChange` — 이 API는 변경 없음

  **Acceptance Criteria**:
  - [ ] Input: `w-80` 제거됨, `inputType` prop 제거됨, `value` optional
  - [ ] Input: focus 시 ring 표시, disabled 시 opacity
  - [ ] Input: Reset 버튼이 값 있을 때만 표시
  - [ ] InputField: focus-within ring 추가
  - [ ] DatePicker: focus-within ring 추가
  - [ ] SearchBox: focus-within ring 추가
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm test` — 기존 DatePicker 테스트 5개 통과

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Input family focus ring 통합 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Navigate to Input story → Tab으로 포커스 → focus ring 확인
      2. Navigate to InputField story → Tab으로 포커스 → focus ring 확인
      3. Navigate to DatePicker story → Tab으로 포커스 → focus ring 확인
      4. Navigate to SearchBox story → Tab으로 포커스 → focus ring 확인
      5. Screenshot each: .sisyphus/evidence/task-4-input-family-focus.png
    Expected Result: 4개 컴포넌트 모두 동일한 focus ring 스타일
    Evidence: .sisyphus/evidence/task-4-input-family-focus.png

  Scenario: Input 고정 너비 제거 확인
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Navigate to Input story
      2. Assert: input wrapper에 w-80 클래스 없음
      3. Viewport width 변경 (800px → 400px)
      4. Assert: Input이 부모 너비에 따라 반응형으로 조절됨
    Expected Result: 고정 너비가 아닌 유연한 너비
    Evidence: .sisyphus/evidence/task-4-input-responsive.png
  ```

  **Commit**: YES
  - Message: `design(design-system): Input 패밀리 focus ring 추가 및 Input 컴포넌트 정상화`
  - Files: `packages/client/design-system/src/components/input/`, `input-field/`, `date-picker/`, `search-box/`
  - Pre-commit: `pnpm test --filter @samilhero/design-system`

---

- [x] 5. Badge + IconButton + Chips 현대화

  **What to do**:
  - **Badge**:
    - `cva` 적용
    - variant 확장: 기존 `success`, `warning`, `info` 유지 + `default`, `destructive`, `outline` 추가
    - Shadcn 스타일: `inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring`
    - 기존 variant 이름 유지 (admin의 MissionStatusBadge가 `variant="info"|"success"` 사용)
    - MissionStatusBadge의 `className="bg-gray-100 text-gray-600"` override → `cn()` 덕에 안전하게 동작
  - **IconButton**:
    - `cva` 적용
    - variant 추가: 기존 `ghost`, `filled` + `outline` 추가
    - disabled 스타일: `disabled:pointer-events-none disabled:opacity-50`
    - focus ring: `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`
    - transition: `transition-colors`
  - **Chips**:
    - `cva` 적용
    - variant 추가: `default`, `secondary`, `outline`
    - 선택적 dismiss(제거) 버튼: `onDismiss` prop 추가 (옵션)
    - size 시스템: `sm`, `md`
  - 각 스토리 업데이트
  - Admin 소비 코드 확인:
    - Badge: variant 이름 유지이므로 변경 불필요
    - IconButton: `variant="ghost"` 유지이므로 변경 불필요

  **Must NOT do**:
  - Badge 기존 variant 이름(`success`, `warning`, `info`) 변경/삭제 금지
  - IconButton의 `icon` prop 구조 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3개 소형 컴포넌트 스타일링 일괄 처리
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/badge/index.tsx` — 현재 Badge. variantClasses Record 패턴. 3 variants.
  - `packages/client/design-system/src/components/icon-button/index.tsx` — 현재 IconButton. sizeClasses/squareClasses/variantClasses.
  - `packages/client/design-system/src/components/chips/index.tsx` — 현재 Chips. 단일 스타일, variant 없음.
  - `packages/client/missionary-admin/src/app/(admin)/missions/components/MissionStatusBadge.tsx` — Badge 커스텀 래퍼. `variant="info"|"success"` 사용, COMPLETED는 className override.

  **Acceptance Criteria**:
  - [ ] Badge: 6개 variant (success, warning, info, default, destructive, outline)
  - [ ] IconButton: 3개 variant (ghost, filled, outline) + disabled + focus ring
  - [ ] Chips: variant 시스템 + optional dismiss
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0 (Badge/IconButton API 호환)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Badge/IconButton/Chips variant 시각적 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Badge 각 variant(6개) 스토리 확인, 시각적 구분 검증
      2. IconButton variant(3개) + disabled 확인
      3. Chips variant + dismiss 버튼 확인
      4. Screenshot: .sisyphus/evidence/task-5-badge-iconbutton-chips.png
    Expected Result: 모든 variant 시각적 구분, disabled 흐리게
    Evidence: .sisyphus/evidence/task-5-badge-iconbutton-chips.png
  ```

  **Commit**: YES
  - Message: `design(design-system): Badge, IconButton, Chips cva 적용 및 variant 확장`
  - Files: `packages/client/design-system/src/components/badge/`, `icon-button/`, `chips/`
  - Pre-commit: `pnpm test --filter @samilhero/design-system`

---

- [x] 6. Form Controls 비주얼 추가 — Checkbox, Radio, Switch + Groups

  **What to do**:
  - **Checkbox 기본 비주얼 추가**:
    - 현재: `sr-only` input + empty `<div>` (children 필수)
    - 변경: children이 없을 때 기본 비주얼 렌더링
    - 기본 비주얼: `w-4 h-4 rounded border border-gray-30 transition-colors` + checked 시 `bg-primary-80 border-primary-80` + 체크마크 SVG
    - children이 있으면 기존대로 children만 렌더 (하위 호환)
    - `<div>` 클릭 핸들러 유지 (RHF 호환 필수)
    - label 텍스트 지원: `label` prop 추가 (옵션) — checkbox 옆 텍스트
  - **Radio 기본 비주얼 추가**:
    - 동일 패턴: children 없을 때 기본 원형 라디오 비주얼
    - `w-4 h-4 rounded-full border border-gray-30` + checked 시 내부 dot
  - **Switch 기본 비주얼 추가**:
    - children 없을 때 기본 토글 비주얼
    - track: `w-9 h-5 rounded-full bg-gray-20 transition-colors` + checked 시 `bg-primary-80`
    - thumb: `w-4 h-4 rounded-full bg-white shadow transition-transform` + checked 시 `translate-x-4`
  - **CheckboxGroup / RadioGroup**:
    - 기존 context 패턴 유지
    - flex 정렬 스타일 추가 (gap, direction)
  - **기존 테스트 업데이트**:
    - Checkbox 4개, Radio 4개, Switch 4개 테스트 — 비주얼 추가로 인한 DOM 구조 변경 반영
    - RHF 통합 동작은 반드시 유지

  **Must NOT do**:
  - hidden input + div click 패턴 변경 금지 (RHF 호환의 핵심)
  - CheckboxGroupActionsContext / RadioGroupActionsContext 인터페이스 변경 금지
  - `sr-only` input 제거 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: headless 컴포넌트에 시각적 레이어 추가하는 섬세한 작업
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/checkbox/index.tsx` — Checkbox 전체. sr-only input + `<div className={className} onClick>`. CheckboxActionsContext/DataContext. 핵심: `handleInputChange`가 RHF `controlledOnChange` 호출 + groupActions.updateCheckedValue 호출
  - `packages/client/design-system/src/components/radio/index.tsx` — Radio 전체. Checkbox와 동일 패턴. `handleInputChange`에서 groupActions.changeValue 호출
  - `packages/client/design-system/src/components/switch/index.tsx` — Switch 전체. groupActions 없이 독립적. `role="switch"`.
  - `packages/client/design-system/src/components/checkbox-group/` — CheckboxGroup context 제공자
  - `packages/client/design-system/src/components/radio-group/` — RadioGroup context 제공자

  **Test References**:
  - `packages/client/design-system/src/components/checkbox/__tests__/Checkbox.test.tsx` — 4개 테스트. `screen.getByRole('checkbox')`, `userEvent.click`, `register()` spread
  - `packages/client/design-system/src/components/radio/__tests__/Radio.test.tsx` — 4개 테스트
  - `packages/client/design-system/src/components/switch/__tests__/Switch.test.tsx` — 4개 테스트

  **WHY Each Reference Matters**:
  - `checkbox/index.tsx`: children 렌더링 분기 지점을 이해해야 기본 비주얼을 children 대체로 추가 가능
  - 기존 테스트: DOM 구조가 바뀌면 `screen.getByRole` 등의 쿼리가 깨질 수 있으므로 미리 확인

  **Acceptance Criteria**:
  - [ ] Checkbox: children 없이 렌더 시 체크박스 비주얼 표시
  - [ ] Radio: children 없이 렌더 시 라디오 비주얼 표시
  - [ ] Switch: children 없이 렌더 시 토글 비주얼 표시
  - [ ] 각 checked/unchecked 시각적 상태 전환
  - [ ] 기존 12개 테스트 (Checkbox 4 + Radio 4 + Switch 4) 통과
  - [ ] `pnpm build:ds` — exit 0

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Form controls 기본 비주얼 + 인터랙션 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Checkbox story → children 없는 기본 렌더 확인 → 클릭 → checked 비주얼 변화 확인
      2. Radio story → 기본 렌더 → 클릭 → 선택 dot 표시
      3. Switch story → 기본 렌더 → 클릭 → track 색상 + thumb 위치 변화
      4. Screenshot: .sisyphus/evidence/task-6-form-controls.png
    Expected Result: 3개 컴포넌트 모두 클릭 시 시각적 상태 전환
    Evidence: .sisyphus/evidence/task-6-form-controls.png

  Scenario: 기존 RHF 통합 테스트 통과 확인
    Tool: Bash
    Steps:
      1. pnpm test --filter @samilhero/design-system
      2. Assert: Checkbox 4, Radio 4, Switch 4 테스트 모두 PASS
    Expected Result: 12개 기존 테스트 통과
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `design(design-system): Checkbox, Radio, Switch 기본 비주얼 추가`
  - Files: `packages/client/design-system/src/components/checkbox/`, `radio/`, `switch/`, `checkbox-group/`, `radio-group/`
  - Pre-commit: `pnpm test --filter @samilhero/design-system`

---

- [x] 7. 나머지 컴포넌트 현대화 — Tab, Tooltip, NavItem, Pagination, Divider, Text, TopButton

  **What to do**:
  - **Tab 현대화**:
    - `<div>` → `<button>` 으로 변경 + `role="tab"`, `role="tablist"` 추가
    - 패딩 개선: `p-2.5` → `px-4 py-2`
    - 하단 인디케이터: `border-b-2` (active: `border-primary-80`, inactive: `border-transparent`)
    - focus ring: `focus-visible:outline-none focus-visible:ring-1`
    - transition: `transition-colors`
    - keyboard: Tab 키로 이동 가능 (기본 button 동작으로 충분)
  - **Tooltip 개선**:
    - 화살표 추가: CSS `before` pseudo-element 또는 inline SVG
    - 배경색 개선: `bg-gray-90` (더 진한 배경)
    - 패딩: `px-3 py-1.5`
    - `text-xs`
    - `role="tooltip"` 추가
    - `position` prop 추가: `'top' | 'bottom' | 'left' | 'right'` (default: 'top')
  - **NavItem 폴리싱** (이미 양호):
    - transition 추가 (있으면 확인)
    - focus ring 확인
  - **Pagination 폴리싱** (이미 양호):
    - active 페이지 스타일 강화: `bg-primary-80 text-white rounded-md` (현재 bold만)
    - focus ring 추가
  - **Divider 개선**:
    - `orientation` prop 추가: `'horizontal' | 'vertical'` (기존은 horizontal만)
    - vertical: `w-px h-full` 또는 `w-[1px] self-stretch`
    - height prop 유연화: 현재 `4 | 10 | 12 | 24` 제한 → `className`으로 유연하게 (또는 유지)
  - **Text** (이미 양호):
    - 변경 최소화. `typography-*` 클래스는 SCSS에서 관리하므로 건드리지 않음.
  - **TopButton 폴리싱**:
    - shadow 추가: `shadow-md`
    - hover transition: `transition-all`
    - focus ring 추가
  - 각 스토리 업데이트

  **Must NOT do**:
  - `_typography.scss` 수정 금지
  - Text의 `typo` prop이 참조하는 `typography-*` CSS 클래스 변경 금지
  - Tab에 복잡한 키보드 내비게이션(arrow 키) 추가 금지 — button의 기본 Tab 키 이동으로 충분
  - NavItem의 기존 prop API 변경 금지 (admin Sidebar에서 사용 중)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 7개 컴포넌트 일괄 스타일 폴리싱
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/tab/index.tsx` — Tab. `<div>` 사용, `onClick`, `border-b`. 시맨틱 개선 필요.
  - `packages/client/design-system/src/components/tooltip/index.tsx` — Tooltip. CSS-only hover, 화살표 없음. `group`/`group-hover` Tailwind 패턴.
  - `packages/client/design-system/src/components/nav-item/index.tsx` — NavItem. polymorphic(a/button), depth 기반 스타일. admin Sidebar에서 사용.
  - `packages/client/design-system/src/components/pagination/index.tsx` — Pagination. 좋은 a11y(aria-label, aria-current). active=bold만.
  - `packages/client/design-system/src/components/divider/index.tsx` — Divider. horizontal only, 4개 height 옵션.
  - `packages/client/design-system/src/components/text/index.tsx` — Text. Polymorphic `as` prop. `typography-*` 클래스.
  - `packages/client/design-system/src/components/top-button/index.tsx` — TopButton. shadow 없음, opacity-70 hover.

  **Acceptance Criteria**:
  - [ ] Tab: `<button>` + `role="tab"` 사용, focus ring, active indicator(border-b-2)
  - [ ] Tooltip: 화살표 표시, position prop (top/bottom/left/right)
  - [ ] Pagination: active 페이지에 배경색
  - [ ] Divider: orientation prop (horizontal/vertical)
  - [ ] TopButton: shadow 추가
  - [ ] 모든 컴포넌트에 transition 적용
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tab 시맨틱 + 스타일 검증
    Tool: Playwright (playwright skill)
    Preconditions: Storybook running
    Steps:
      1. Tab story 이동
      2. Assert: role="tablist" 컨테이너 존재
      3. Assert: 각 탭이 role="tab" 속성 보유
      4. 탭 클릭 → active indicator(두꺼운 하단 border) 확인
      5. Tab 키로 포커스 이동 → focus ring 확인
      6. Screenshot: .sisyphus/evidence/task-7-components.png
    Expected Result: 시맨틱 탭, 시각적 active 표시, focus ring
    Evidence: .sisyphus/evidence/task-7-components.png
  ```

  **Commit**: YES
  - Message: `design(design-system): Tab, Tooltip, Pagination 등 나머지 컴포넌트 현대화`
  - Files: `packages/client/design-system/src/components/tab/`, `tooltip/`, `nav-item/`, `pagination/`, `divider/`, `text/`, `top-button/`
  - Pre-commit: `pnpm test --filter @samilhero/design-system && pnpm build:admin`

---

- [ ] 8. 스토리 검수 + 신규 테스트 + 최종 검증

  **What to do**:
  - **신규 테스트 작성** (~20개):
    - `Button`: 렌더링, variant별 클래스, size별 클래스, disabled 상태, onClick, RHF register spread (5-6 tests)
    - `InputField`: 렌더링, label 표시, error 표시, disabled, onClear, RHF register spread (4-5 tests)
    - `Tab`: 렌더링, 탭 클릭 onChange, active 상태 (3 tests)
    - `Badge`: 렌더링, variant별 클래스 (2-3 tests)
    - `IconButton`: 렌더링, variant, disabled, onClick (3-4 tests)
  - **기존 23개 테스트 확인**:
    - API 변경된 컴포넌트(Checkbox, Radio, Switch, Select, DatePicker)의 테스트가 통과하는지 확인
    - 실패 시 DOM 구조 변경 반영하여 수정
  - **전체 스토리 검수**:
    - 21개 스토리 파일에서 deprecated prop 사용 여부 확인
    - TypeScript 에러 0개 확인 (`pnpm build-storybook`)
    - 모든 스토리가 렌더링되는지 Playwright로 확인
  - **최종 검증 체인**:
    ```bash
    pnpm test --filter @samilhero/design-system  # 43+ tests, 0 failures
    pnpm build:ds                                  # exit 0
    pnpm build:admin                               # exit 0
    pnpm type-check                                # exit 0
    pnpm lint:all                                  # exit 0
    ```

  **Must NOT do**:
  - 스냅샷 테스트 추가 금지
  - Storybook MDX 문서 페이지 작성 금지
  - 이전 태스크에서 완료된 컴포넌트 스타일 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 테스트 작성 + 스토리 검수 + 전체 검증이 혼합된 작업
  - **Skills**: [`playwright`]
    - `playwright`: Storybook 스토리 시각적 검증에 필수

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (단독, 최종)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3, 4, 5, 6, 7

  **References**:

  **Test References**:
  - `packages/client/design-system/src/components/checkbox/__tests__/Checkbox.test.tsx` — 기존 테스트 패턴. `describe/it` 구조, `@testing-library/react` render, `screen.getByRole`, `userEvent.click`, `expect(onChange).toHaveBeenCalled`
  - `packages/client/design-system/src/components/select/__tests__/Select.test.tsx` — 기존 Select 테스트 패턴
  - `packages/client/design-system/vitest.config.ts` — vitest 설정
  - `packages/client/design-system/vitest.setup.ts` — 테스트 셋업 (SVG mock 등)

  **Acceptance Criteria**:
  - [ ] 신규 테스트 ~20개 작성
  - [ ] `pnpm test --filter @samilhero/design-system` — 43+ tests, 0 failures, exit 0
  - [ ] `pnpm build:ds` — exit 0
  - [ ] `pnpm build:admin` — exit 0
  - [ ] `pnpm type-check` — exit 0
  - [ ] `pnpm lint:all` — exit 0
  - [ ] Storybook에서 21개 컴포넌트 스토리 모두 렌더링 정상

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 테스트 스위트 통과
    Tool: Bash
    Steps:
      1. pnpm test --filter @samilhero/design-system -- --reporter=verbose
      2. Assert: 43+ tests
      3. Assert: 0 failures
      4. Assert: exit code 0
    Expected Result: 모든 신규 + 기존 테스트 통과
    Evidence: Terminal output captured

  Scenario: 전체 빌드 체인 통과
    Tool: Bash
    Steps:
      1. pnpm build:ds → Assert exit 0
      2. pnpm build:admin → Assert exit 0
      3. pnpm type-check → Assert exit 0
      4. pnpm lint:all → Assert exit 0
    Expected Result: 빌드, 타입, 린트 모두 통과
    Evidence: Terminal output captured

  Scenario: 전체 Storybook 스토리 렌더링 검증
    Tool: Playwright (playwright skill)
    Preconditions: pnpm sb:ds running on port 6006
    Steps:
      1. Navigate to http://localhost:6006
      2. 각 컴포넌트 스토리(21개)를 순회:
         - Button, Badge, Checkbox, CheckboxGroup, Chips, DatePicker, Divider,
           IconButton, Input, InputField, NavItem, Pagination, Radio, RadioGroup,
           SearchBox, Select, Switch, Tab, Text, Tooltip, TopButton
      3. 각 스토리에서:
         - Assert: 렌더링 에러 없음 (console.error 0개)
         - Assert: 메인 컴포넌트 요소 visible
         - Screenshot: .sisyphus/evidence/task-8-storybook-{component}.png
    Expected Result: 21개 스토리 모두 정상 렌더링
    Evidence: .sisyphus/evidence/task-8-storybook-*.png
  ```

  **Commit**: YES
  - Message: `test(design-system): 주요 컴포넌트 테스트 추가 및 전체 스토리 검수`
  - Files: `packages/client/design-system/src/components/**/__tests__/`, `**/*.stories.tsx`
  - Pre-commit: `pnpm test --filter @samilhero/design-system && pnpm lint:all`

---

## Commit Strategy

| After Task | Message                                                                          | Verification                                                                         |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1          | `refactor(design-system): classnames를 cn(clsx+tailwind-merge)으로 마이그레이션` | `pnpm test && pnpm build:ds && pnpm build:admin`                                     |
| 2          | `design(design-system): Button Shadcn 스타일 리팩토링 및 cva 적용`               | `pnpm test && pnpm build:ds && pnpm build:admin`                                     |
| 3          | `design(design-system): Select 컴포넌트 스타일링 추가 및 타입 에러 수정`         | `pnpm test && pnpm build:ds`                                                         |
| 4          | `design(design-system): Input 패밀리 focus ring 추가 및 Input 컴포넌트 정상화`   | `pnpm test && pnpm build:ds`                                                         |
| 5          | `design(design-system): Badge, IconButton, Chips cva 적용 및 variant 확장`       | `pnpm test && pnpm build:ds && pnpm build:admin`                                     |
| 6          | `design(design-system): Checkbox, Radio, Switch 기본 비주얼 추가`                | `pnpm test && pnpm build:ds`                                                         |
| 7          | `design(design-system): Tab, Tooltip, Pagination 등 나머지 컴포넌트 현대화`      | `pnpm test && pnpm build:ds && pnpm build:admin`                                     |
| 8          | `test(design-system): 주요 컴포넌트 테스트 추가 및 전체 스토리 검수`             | `pnpm test && pnpm build:ds && pnpm build:admin && pnpm type-check && pnpm lint:all` |

---

## Success Criteria

### Verification Commands

```bash
# Design system tests (43+ expected)
pnpm test --filter @samilhero/design-system   # Expected: 43+ tests, 0 failures

# Design system build
pnpm build:ds                                   # Expected: exit 0

# Admin build (consumer compatibility)
pnpm build:admin                                # Expected: exit 0

# Monorepo type check
pnpm type-check                                 # Expected: exit 0

# Lint
pnpm lint:all                                   # Expected: exit 0

# classnames 완전 제거 확인
grep -r "from 'classnames'" packages/client/design-system/src/  # Expected: 0 matches

# Select 경고 제거 확인
pnpm test --filter @samilhero/design-system 2>&1 | grep -c "uncontrolled"  # Expected: 0
```

### Final Checklist

- [ ] All "Must Have" present (focus rings, transitions, disabled states, Button padding, Select styling, cn())
- [ ] All "Must NOT Have" absent (no @radix-ui, no theme.css color changes, no \_typography.scss changes)
- [ ] All 43+ tests pass
- [ ] All 21 Storybook stories render without errors
- [ ] missionary-admin builds and runs without TypeScript errors
