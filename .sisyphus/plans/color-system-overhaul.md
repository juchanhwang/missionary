# 컬러 시스템 전면 개편 — 삼일교회 톤앤매너 기반

## TL;DR

> **Quick Summary**: 디자인 시스템의 컬러 토큰을 삼일교회 로고 레드(#EC2327) 기반 primary로 전면 교체하고, 시맨틱 오류(error=노랑)를 정상화하며, 웜 뉴트럴 그레이로 전환하여 모던하고 따뜻한 톤앤매너를 구현한다.
>
> **Deliverables**:
>
> - 전체 컬러 팔레트 교체 (theme.css)
> - warning 팔레트 신규 추가
> - DatePicker 하드코딩 색상 테마 토큰 마이그레이션
> - SVG 아이콘 하드코딩 색상 수정
> - Badge 컴포넌트 warning 시맨틱 정상화
>
> **Estimated Effort**: Medium (3-4시간)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (팔레트 설계) → Task 2 (theme.css 교체) → Task 3, 4, 5 (병렬 정리) → Task 6 (검증)

---

## Context

### Original Request

사용자는 현재 프로젝트의 컬러가 "너무 구리다"고 판단하여, https://www.samilchurch.com/ 을 참고해 톤앤매너를 맞추길 원한다. 메인 컬러인 로고의 빨간색을 primary로 사용하고, 배경색 등 모던한 컬러를 선택해달라고 요청했다.

### Interview Summary

**Key Discussions**:

- Primary: #EC2327 (삼일교회 로고 색) 기준
- Secondary: 다크 차콜 (#2C3E50 계열) — 차분하고 모던한 보완색
- Error/Warning: 시맨틱 정상화 (error=빨강, warning=노랑 신규 추가)
- Gray: 쿨블루 언더톤 → 웜 뉴트럴로 전환
- 하드코딩 색상: DatePicker + SVG 아이콘 같이 정리
- OAuth 버튼: 브랜드 색이므로 유지

**Research Findings**:

- 삼일교회 사이트 핵심 컬러: #EC2327(브랜드 레드), #B01013(딥 버건디), #FF766A(코랄), #F2ECE7(따뜻한 베이지 배경), #361300(다크 브라운 텍스트)
- 현재 시스템: theme.css 단일 파일(@theme directive)이 Single Source of Truth
- 59개 토큰 → 24+ 컴포넌트 파일, 16+ admin 파일에서 Tailwind 클래스로 소비
- 토큰 이름(primary-80 등) 유지하고 값만 교체하면 컴포넌트 자동 반영

### Metis Review

**Identified Gaps** (addressed):

- `bg-primary-10`이 admin 전체 배경으로 사용됨 → primary-10을 따뜻한 크림(핑크 아님)으로 설계
- SVG 아이콘(icon-input-error.svg, icon-input-reset.svg)에 하드코딩 색상 → scope에 포함
- Badge warning이 `error-*` 토큰 참조 중 → `warning-*`로 코드 변경 필요
- DatePicker 선택일이 파란색 → 빨강은 "에러" 느낌이므로 blue 토큰 기반 유지
- Admin 테이블 페이지가 Tailwind 기본 gray 사용 → out of scope (follow-up)

---

## Work Objectives

### Core Objective

디자인 시스템의 컬러 토큰 값을 삼일교회 브랜드 레드 기반으로 전면 교체하여, 모던하고 따뜻한 톤앤매너를 구현한다.

### Concrete Deliverables

- `packages/client/design-system/src/styles/theme.css` — 전체 컬러 값 교체 + warning 팔레트 추가
- `packages/client/design-system/src/components/date-picker/DatePickerStyles.css` — 하드코딩 hex → CSS variable
- `packages/client/design-system/src/assets/icons/icon-input-error.svg` — fill 색상 수정
- `packages/client/design-system/src/assets/icons/icon-input-reset.svg` — fill 색상 수정
- `packages/client/design-system/src/components/badge/index.tsx` — warning variant 토큰 변경

### Definition of Done

- [ ] `pnpm build:ds && pnpm build:admin && pnpm build:app` → exit code 0
- [ ] `pnpm type-check` → exit code 0
- [ ] theme.css에 warning 팔레트 9단계 존재
- [ ] DatePickerStyles.css에 하드코딩 hex 값 0개
- [ ] SVG 아이콘에 이전 error 색상(#EBBB13) 없음
- [ ] Storybook에서 주요 컴포넌트 시각 확인 완료

### Must Have

- 모든 팔레트 9단계(10-90) 유지 (gray는 02/05 포함 11단계)
- WCAG AA 대비율 충족 (text on background ≥ 4.5:1)
- 기존 토큰 이름 100% 유지 (값만 변경)
- warning 팔레트 신규 추가

### Must NOT Have (Guardrails)

- 토큰 이름 변경 금지 (primary-80, error-60 등 기존 이름 유지)
- 팔레트 단계 수 변경 금지 (기존 9단계 구조 유지)
- 컴포넌트 API/props/variant 구조 변경 금지 (Badge.warning 토큰 참조만 변경)
- OAuth 버튼 색상(#FEE500, #F2F2F2 등) 변경 금지 (브랜드 가이드 색)
- Admin 테이블 페이지의 Tailwind 기본 gray 클래스 마이그레이션 금지 (follow-up)
- 새로운 시맨틱 토큰(bg-surface 등) 추가 금지
- 다크 모드 추가 금지

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: NO (프론트엔드 컴포넌트 테스트 없음)
- **Automated tests**: NO — 시각적 변경이므로 Agent-Executed QA로 검증
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type          | Tool                          | How Agent Verifies                        |
| ------------- | ----------------------------- | ----------------------------------------- |
| CSS 토큰 변경 | Bash (grep)                   | 토큰 존재/값 확인, 하드코딩 hex 부재 확인 |
| 빌드 검증     | Bash (pnpm)                   | build, type-check 명령 실행               |
| 시각 검증     | Playwright (playwright skill) | Storybook 컴포넌트 스크린샷 촬영          |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Sequential):
├── Task 1: 새 컬러 팔레트 설계 (hex 값 확정)
└── Task 2: theme.css 토큰 값 교체 + warning 추가

Wave 2 (After Wave 1 — Parallel):
├── Task 3: DatePicker 하드코딩 색상 마이그레이션
├── Task 4: SVG 아이콘 색상 수정
└── Task 5: Badge warning 토큰 참조 수정

Wave 3 (After Wave 2):
└── Task 6: 빌드 검증 + Storybook 시각 QA

Critical Path: Task 1 → Task 2 → Task 6
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks       | Can Parallelize With |
| ---- | ---------- | ------------ | -------------------- |
| 1    | None       | 2            | None (design first)  |
| 2    | 1          | 3, 4, 5      | None (theme first)   |
| 3    | 2          | 6            | 4, 5                 |
| 4    | 2          | 6            | 3, 5                 |
| 5    | 2          | 6            | 3, 4                 |
| 6    | 3, 4, 5    | None (final) | None                 |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                                                                            |
| ---- | ------- | --------------------------------------------------------------------------------------------- |
| 1    | 1→2     | task(category="visual-engineering", load_skills=["frontend-design"], run_in_background=false) |
| 2    | 3, 4, 5 | 3개 모두 동일 Task에서 순차 처리 (파일 수 적어서 병렬 불필요)                                 |
| 3    | 6       | task(category="quick", load_skills=["playwright"], run_in_background=false)                   |

---

## TODOs

- [x] 1. 새 컬러 팔레트 설계 — 모든 hex 값 확정

  **What to do**:
  삼일교회 브랜드 레드(#EC2327)를 기반으로 전체 컬러 팔레트의 hex 값을 설계한다.
  이 태스크의 산출물은 theme.css에 들어갈 정확한 hex 값 목록이다.

  **설계 원칙**:
  - **Primary (Red)**: #EC2327을 primary-50 앵커로, 10→90까지 밝은 크림~딥 버건디 그라데이션
    - primary-10: 따뜻한 크림/로즈 화이트 (핑크가 아닌 중성적 따뜻함, admin 전체 배경으로 사용됨)
    - primary-50: #EC2327 근처 (브랜드 메인 컬러)
    - primary-80: 딥 버건디/다크 레드 (버튼, 헤더 텍스트 등 주요 인터랙션 컬러)
  - **Secondary (Dark Charcoal)**: #2C3E50 계열을 secondary-50~60 앵커로
    - 차분하고 모던한 다크 차콜 그라데이션
    - primary 레드의 보완색 역할
  - **Error (Red-based)**: 빨간 계열 — primary와 겹치지 않도록 오렌지-레드 또는 로즈-레드 계열
  - **Warning (NEW — Yellow/Amber)**: 기존 error 값을 기반으로 하되 모던하게 조정
  - **Blue (Info)**: 현재 값을 모던하게 조정 (더 선명하거나 약간 따뜻한 블루)
  - **Green (Success)**: 현재 값을 모던하게 조정 (더 생동감 있는 그린)
  - **Gray (Warm Neutral)**: 쿨블루 언더톤 제거, 따뜻한 웜그레이로 전환
    - 삼일교회 사이트의 #F2ECE7, #F0EAE6 같은 따뜻한 느낌 참고
    - 하지만 UI 배경으로 사용되므로 너무 베이지하지 않게 (subtle warm)

  **WCAG AA 대비율 확인**:
  - primary-80 텍스트 on white → ≥ 4.5:1
  - error-60 텍스트 on white → ≥ 4.5:1
  - gray-60 텍스트 on white → ≥ 4.5:1

  **Must NOT do**:
  - primary-10을 선명한 핑크로 만들지 않을 것 (admin 전체 배경이므로)
  - error를 primary와 혼동될 정도로 비슷한 빨강으로 만들지 않을 것
  - gray에 강한 노란/갈색 언더톤 넣지 않을 것 (subtle warmth만)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 컬러 팔레트 설계는 디자인 + 프론트엔드 크로스오버 영역
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 모던하고 세련된 컬러 선택 전문. AI-generic 미학을 피하고 실제 디자이너 관점의 팔레트 설계

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Task 2와 순차)
  - **Blocks**: Task 2
  - **Blocked By**: None (첫 태스크)

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/styles/theme.css:1-60` — 현재 @theme 구조와 토큰 네이밍 패턴. 새 팔레트도 동일 구조 유지해야 함

  **External References**:
  - 삼일교회 사이트 분석 결과: `.sisyphus/evidence/samilchurch-color-analysis.md` — 브랜드 컬러 (#EC2327, #B01013, #FF766A) 및 배경색 (#F2ECE7, #F0EAE6) 참고
  - WCAG Contrast Checker: `https://webaim.org/resources/contrastchecker/` — 대비율 검증

  **WHY Each Reference Matters**:
  - theme.css: 새 팔레트가 들어갈 정확한 구조(토큰 이름, 단계 수)를 파악하기 위해
  - 삼일교회 분석: 타겟 톤앤매너의 실제 hex 값을 참고하기 위해

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 팔레트 구조 완전성 검증
    Tool: Bash (manual check)
    Preconditions: 팔레트 hex 값 목록이 확정됨
    Steps:
      1. primary 팔레트: 10, 20, 30, 40, 50, 60, 70, 80, 90 — 9개 확인
      2. secondary 팔레트: 10~90 — 9개 확인
      3. error 팔레트: 10~90 — 9개 확인
      4. warning 팔레트 (NEW): 10~90 — 9개 확인
      5. blue 팔레트: 10~90 — 9개 확인
      6. green 팔레트: 10~90 — 9개 확인
      7. gray 팔레트: 02, 05, 10, 20, 30, 40, 50, 60, 70, 80, 90 — 11개 확인
      8. white, black — 2개 확인
    Expected Result: 총 68개 토큰 값 (기존 59 + warning 9)
    Evidence: 설계된 팔레트 hex 값 목록 텍스트

  Scenario: WCAG AA 대비율 검증
    Tool: Bash (node script 또는 계산)
    Preconditions: primary-80, error-60, gray-60 hex 값 확정
    Steps:
      1. primary-80 on #ffffff → contrast ratio 계산
      2. error-60 on #ffffff → contrast ratio 계산
      3. gray-60 on #ffffff → contrast ratio 계산
      4. Assert 모든 값 ≥ 4.5
    Expected Result: 3개 모두 WCAG AA 통과
    Evidence: 대비율 계산 결과 출력
  ```

  **Commit**: NO (설계만, 코드 변경 없음)

---

- [x] 2. theme.css 컬러 토큰 값 전면 교체

  **What to do**:
  Task 1에서 확정한 hex 값으로 `theme.css`의 모든 `@theme` 토큰 값을 교체하고, warning 팔레트 9단계를 추가한다.
  - 기존 primary 10~90: 값만 교체 (빨강 기반)
  - 기존 secondary 10~90: 값만 교체 (다크 차콜 기반)
  - 기존 error 10~90: 값만 교체 (빨강 계열, primary와 구분)
  - **NEW** warning 10~90: 9단계 추가 (노랑/앰버 계열)
  - 기존 blue 10~90: 값 조정 (모던하게)
  - 기존 green 10~90: 값 조정 (모던하게)
  - 기존 gray 02~90: 값 교체 (웜 뉴트럴)
  - white, black: 유지 (#fff, #000)

  **Must NOT do**:
  - 토큰 이름 변경 금지 (`--color-primary-80` 등 기존 이름 유지)
  - 단계 수 변경 금지 (primary는 10~90 9단계, gray는 02/05/10~90 11단계)
  - @theme 외부에 새 선언 추가 금지
  - warning 토큰은 error 블록 바로 뒤에 추가

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS 테마 파일 직접 수정 + 디자인 감각 필요
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 컬러 값의 시각적 조화를 판단하여 적용

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Task 1 직후)
  - **Blocks**: Task 3, 4, 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/styles/theme.css:1-60` — 현재 파일 전체. 이 파일의 구조를 그대로 유지하면서 값만 교체해야 함
  - `packages/client/design-system/src/styles/tailwind.css:1-3` — theme.css를 import하는 진입점. 구조 확인용

  **Usage References** (이 토큰들이 어디서 소비되는지):
  - `packages/client/design-system/src/components/button/index.tsx:27-33` — primary-80/60/90/40/20/10, secondary-50/40/70/20/30 사용. 버튼 filled/outline 상태별 컬러
  - `packages/client/design-system/src/components/badge/index.tsx:15-18` — green-10/50, error-10/70, primary-10/80 사용. 배지 variant별 컬러
  - `packages/client/design-system/src/components/nav-item/index.tsx:37-46` — secondary-10, primary-80 사용. 사이드바 네비게이션 컬러
  - `packages/client/missionary-admin/src/app/(admin)/AdminLayoutClient.tsx:31` — `bg-primary-10` 사용. **Admin 전체 콘텐츠 영역 배경**. primary-10 값이 극히 중요
  - `packages/client/missionary-admin/src/components/sidebar/Sidebar.tsx:80` — `bg-primary-70` 사용. 사이드바 배경. primary-70이 충분히 어두운 레드/버건디여야 함
  - `packages/client/missionary-admin/src/components/header/Header.tsx:17` — `text-primary-80` 사용. 헤더 제목 텍스트
  - `packages/client/missionary-admin/src/components/boundary/AuthLoadingFallback.tsx:6` — `border-t-primary-60` 사용. 로딩 스피너 컬러

  **WHY Each Reference Matters**:
  - button: primary/secondary의 10~90 단계가 hover/active/disabled 상태에 사용됨. 각 단계 간 시각적 구분 필수
  - AdminLayoutClient: primary-10이 전체 배경. 핑크가 되면 안 되고, 따뜻한 크림/로즈화이트여야 함
  - Sidebar: primary-70이 사이드바 배경. 딥 레드/버건디로 시각적 무게감 있어야 함
  - nav-item: secondary-10이 자식 네비 배경. 새 secondary(차콜)의 밝은 변형이 어울려야 함

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: theme.css 토큰 완전성 검증
    Tool: Bash (grep)
    Preconditions: theme.css 수정 완료
    Steps:
      1. grep -c "color-primary-" packages/client/design-system/src/styles/theme.css
         → Assert: 9
      2. grep -c "color-secondary-" packages/client/design-system/src/styles/theme.css
         → Assert: 9
      3. grep -c "color-error-" packages/client/design-system/src/styles/theme.css
         → Assert: 9
      4. grep -c "color-warning-" packages/client/design-system/src/styles/theme.css
         → Assert: 9 (NEW)
      5. grep -c "color-blue-" packages/client/design-system/src/styles/theme.css
         → Assert: 9
      6. grep -c "color-green-" packages/client/design-system/src/styles/theme.css
         → Assert: 9
      7. grep -c "color-gray-" packages/client/design-system/src/styles/theme.css
         → Assert: 11
      8. grep "color-white\|color-black" packages/client/design-system/src/styles/theme.css
         → Assert: 2줄
    Expected Result: 총 68개 토큰 (기존 59 + warning 9)
    Evidence: grep 출력 결과 캡처

  Scenario: 이전 primary 색상(네이비) 완전 제거 확인
    Tool: Bash (grep)
    Steps:
      1. grep "#17234e\|#091131\|#344176\|#5a6595\|#727ca4" packages/client/design-system/src/styles/theme.css
         → Assert: no match (이전 네이비 primary 값들이 없어야 함)
      2. grep "#f5f5fa\|#e2e4ee\|#c6cadb\|#9da4bf" packages/client/design-system/src/styles/theme.css
         → Assert: no match (이전 primary 밝은 톤도 없어야 함)
    Expected Result: 이전 primary 컬러 잔존 없음
    Evidence: grep 출력

  Scenario: @theme 블록 구조 유효성
    Tool: Bash (grep)
    Steps:
      1. head -1 packages/client/design-system/src/styles/theme.css
         → Assert: "@theme {"
      2. tail -1 packages/client/design-system/src/styles/theme.css | tr -d '[:space:]'
         → Assert: "}" 포함
    Expected Result: @theme 블록이 올바르게 열리고 닫힘
    Evidence: head/tail 출력
  ```

  **Commit**: YES
  - Message: `design: 컬러 시스템 전면 교체 — 삼일교회 브랜드 레드 기반`
  - Files: `packages/client/design-system/src/styles/theme.css`
  - Pre-commit: `pnpm type-check`

---

- [ ] 3. DatePicker 하드코딩 색상 → CSS variable 마이그레이션

  **What to do**:
  `DatePickerStyles.css`의 하드코딩된 11개 hex 값을 새 테마 토큰에 맞는 CSS variable로 교체한다.

  **매핑 테이블** (새 팔레트 기반으로 결정):
  | 현재 하드코딩 | 역할 | 교체 대상 |
  |---|---|---|
  | `#e5e7eb` | border | `var(--color-gray-10)` |
  | `#f9fafb` | header bg | `var(--color-gray-02)` |
  | `#111827` | month title text | `var(--color-gray-90)` |
  | `#6b7280` | day name text, nav icon | `var(--color-gray-50)` |
  | `#374151` | day text | `var(--color-gray-70)` |
  | `#f3f4f6` | day hover bg | `var(--color-gray-05)` |
  | `#2563eb` | selected day bg | `var(--color-blue-50)` |
  | `#1d4ed8` | selected day hover bg | `var(--color-blue-60)` |
  | `#d1d5db` | disabled day text | `var(--color-gray-20)` |
  | `#9ca3af` | outside month text | `var(--color-gray-30)` |

  **주의**: 선택된 날짜 색상은 `blue`(info) 토큰을 사용한다. `primary`(빨강)를 사용하면 "에러/불가" 느낌이 되므로 의도적으로 blue 유지.

  **Must NOT do**:
  - DatePicker 구조적 CSS 변경 금지 (spacing, layout 등)
  - 새로운 클래스나 선택자 추가 금지
  - `background-color: white` 같은 CSS 키워드는 그대로 유지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 hex→var 치환 작업. 11개 값을 기계적으로 교체
  - **Skills**: [`frontend-design`]
    - `frontend-design`: 색상 매핑이 시각적으로 적절한지 판단

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/date-picker/DatePickerStyles.css:1-145` — 전체 파일. 각 hex 값의 위치와 CSS 속성 컨텍스트 파악 필요
  - `packages/client/design-system/src/styles/theme.css` — Task 2에서 교체된 새 토큰 값들. CSS variable 참조 시 사용

  **WHY Each Reference Matters**:
  - DatePickerStyles.css: 어떤 hex가 어떤 시각적 역할(border, bg, text)인지 파악하여 올바른 토큰으로 매핑
  - theme.css: CSS variable 이름 참조 (var(--color-gray-10) 등)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 하드코딩 hex 완전 제거 확인
    Tool: Bash (grep)
    Preconditions: DatePickerStyles.css 수정 완료
    Steps:
      1. grep -E "#[0-9a-fA-F]{6}" packages/client/design-system/src/components/date-picker/DatePickerStyles.css
         → Assert: no match (모든 hex 제거됨)
      2. grep "var(--color-" packages/client/design-system/src/components/date-picker/DatePickerStyles.css
         → Assert: 10+ matches (CSS variable로 교체됨)
    Expected Result: hex 0개, CSS variable 10개 이상
    Evidence: grep 출력

  Scenario: CSS 구문 유효성
    Tool: Bash
    Preconditions: 파일 수정 완료
    Steps:
      1. pnpm build:ds
         → Assert: exit code 0 (CSS 파싱 에러 없음)
    Expected Result: 빌드 성공
    Evidence: build 출력
  ```

  **Commit**: YES (Task 4, 5와 함께 그룹 커밋)
  - Message: `refactor: DatePicker, SVG 아이콘, Badge 하드코딩 색상 정리`
  - Files: `DatePickerStyles.css`, `icon-input-error.svg`, `icon-input-reset.svg`, `badge/index.tsx`
  - Pre-commit: `pnpm build:ds`

---

- [ ] 4. SVG 아이콘 하드코딩 색상 수정

  **What to do**:
  2개 SVG 아이콘의 하드코딩 fill 색상을 새 팔레트에 맞게 수정한다.
  - `icon-input-error.svg`: `fill="#EBBB13"` (이전 error-60 노란색) → 새 error-60 값으로 교체 (빨간 계열)
  - `icon-input-reset.svg`: `fill="#C0C5CF"` (이전 gray-20) → 새 gray-20 값으로 교체 (웜 그레이)

  **주의**: SVG 파일은 CSS variable을 직접 사용할 수 없으므로 (inline이 아닌 파일 참조), 새 테마의 해당 토큰 hex 값을 직접 넣는다.

  **Must NOT do**:
  - SVG viewBox, path 데이터 변경 금지
  - icon-input-search.svg 변경 금지 (stroke="black"으로 문제없음)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2개 파일의 단순 hex 값 치환
  - **Skills**: []
    - 단순 치환이므로 추가 스킬 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/assets/icons/icon-input-error.svg:1-4` — 전체 파일. fill="#EBBB13" 위치 확인
  - `packages/client/design-system/src/assets/icons/icon-input-reset.svg:1-6` — 전체 파일. fill="#C0C5CF" 위치 확인
  - `packages/client/design-system/src/styles/theme.css` — Task 2에서 교체된 새 error-60, gray-20 hex 값 참조

  **WHY Each Reference Matters**:
  - SVG 파일: fill 속성의 정확한 위치 파악
  - theme.css: 새 토큰의 hex 값을 SVG에 직접 넣어야 하므로

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 이전 error 색상 제거 확인
    Tool: Bash (grep)
    Steps:
      1. grep "#EBBB13" packages/client/design-system/src/assets/icons/icon-input-error.svg
         → Assert: no match
      2. grep "#C0C5CF" packages/client/design-system/src/assets/icons/icon-input-reset.svg
         → Assert: no match
      3. grep "fill=" packages/client/design-system/src/assets/icons/icon-input-error.svg
         → Assert: match (새 색상으로 교체됨)
    Expected Result: 이전 하드코딩 색상 0개
    Evidence: grep 출력
  ```

  **Commit**: YES (Task 3, 5와 함께 그룹 커밋)

---

- [ ] 5. Badge 컴포넌트 warning variant 토큰 참조 수정

  **What to do**:
  Badge 컴포넌트의 `warning` variant가 현재 `error-*` 토큰을 참조하고 있는데, 이를 새로 추가된 `warning-*` 토큰으로 변경한다.

  현재:

  ```tsx
  warning: 'bg-error-10 text-error-70',
  ```

  변경 후:

  ```tsx
  warning: 'bg-warning-10 text-warning-70',
  ```

  **Must NOT do**:
  - Badge의 variant 타입(success, warning, info) 변경 금지
  - Badge의 props interface 변경 금지
  - 새로운 variant 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 1개 파일, 1줄 변경
  - **Skills**: []
    - 단순 문자열 치환

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/badge/index.tsx:15-19` — variantClasses 객체. warning 줄만 수정

  **WHY Each Reference Matters**:
  - badge/index.tsx: 정확한 수정 위치와 패턴 (bg-{palette}-10 text-{palette}-70 형태)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: warning variant가 warning-* 토큰 참조 확인
    Tool: Bash (grep)
    Steps:
      1. grep "warning:" packages/client/design-system/src/components/badge/index.tsx | grep "warning-"
         → Assert: match
      2. grep "error-" packages/client/design-system/src/components/badge/index.tsx
         → Assert: no match (error 토큰 참조 완전 제거)
    Expected Result: warning variant가 bg-warning-10 text-warning-70 사용
    Evidence: grep 출력
  ```

  **Commit**: YES (Task 3, 4와 함께 그룹 커밋)
  - Message: `refactor: DatePicker, SVG 아이콘, Badge 하드코딩 색상 정리`
  - Files: `DatePickerStyles.css`, `icon-input-error.svg`, `icon-input-reset.svg`, `badge/index.tsx`
  - Pre-commit: `pnpm build:ds`

---

- [x] 6. 빌드 검증 + Storybook 시각 QA

  **What to do**:
  전체 모노레포 빌드와 타입체크를 실행하고, Storybook에서 주요 컴포넌트의 시각적 상태를 스크린샷으로 확인한다.

  **빌드 검증**:
  1. `pnpm build:ds` → exit code 0
  2. `pnpm build:admin` → exit code 0
  3. `pnpm build:app` → exit code 0
  4. `pnpm type-check` → exit code 0

  **시각 QA (Storybook)**:
  1. `pnpm sb:ds` 실행 (port 6006)
  2. Playwright로 Storybook 접속
  3. 주요 컴포넌트별 스크린샷 촬영:
     - Button (filled primary, filled secondary, outline)
     - Badge (success, warning, info)
     - InputField (default, error, disabled)
     - Select (default, active)
     - DatePicker (calendar open, selected date)
     - NavItem (parent, child active)
     - Tab (active, inactive)
     - IconButton (ghost, filled)
  4. 각 스크린샷을 `.sisyphus/evidence/` 에 저장

  **Must NOT do**:
  - 빌드 에러를 무시하지 않을 것
  - type-check 에러를 무시하지 않을 것
  - 스크린샷 없이 "눈으로 확인" 하지 않을 것

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 빌드 실행 + Storybook 스크린샷은 표준 QA 작업
  - **Skills**: [`playwright`]
    - `playwright`: Storybook 페이지 네비게이션 + 스크린샷 촬영

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (최종 검증)
  - **Blocks**: None (마지막 태스크)
  - **Blocked By**: Task 3, 4, 5

  **References**:

  **Pattern References**:
  - Root `package.json` — `pnpm build:ds`, `pnpm build:admin`, `pnpm build:app`, `pnpm type-check`, `pnpm sb:ds` 명령 확인

  **WHY Each Reference Matters**:
  - package.json: 정확한 빌드/QA 명령어 참조

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 빌드 성공
    Tool: Bash
    Steps:
      1. pnpm build:ds → Assert: exit code 0
      2. pnpm build:admin → Assert: exit code 0
      3. pnpm build:app → Assert: exit code 0
      4. pnpm type-check → Assert: exit code 0
    Expected Result: 4개 모두 성공
    Evidence: 각 명령 stdout/stderr 캡처

  Scenario: OAuth 버튼 색상 보존 확인
    Tool: Bash (grep)
    Steps:
      1. grep "#FEE500" packages/client/missionary-admin/src/app/login/page.tsx
         → Assert: match (Kakao 노란색 보존)
      2. grep "#F2F2F2" packages/client/missionary-admin/src/app/login/page.tsx
         → Assert: match (Google 회색 보존)
    Expected Result: OAuth 브랜드 색상 그대로
    Evidence: grep 출력

  Scenario: Storybook 시각 검증 — Button 컴포넌트
    Tool: Playwright (playwright skill)
    Preconditions: pnpm sb:ds 실행 중 (port 6006)
    Steps:
      1. Navigate to: http://localhost:6006/?path=/story/button--default
      2. Wait for: .sb-show-main visible (timeout: 15s)
      3. Screenshot: .sisyphus/evidence/task-6-button-stories.png
    Expected Result: 새 primary(빨강), secondary(차콜) 버튼 컬러 확인
    Evidence: .sisyphus/evidence/task-6-button-stories.png

  Scenario: Storybook 시각 검증 — Badge 컴포넌트
    Tool: Playwright (playwright skill)
    Preconditions: Storybook 실행 중
    Steps:
      1. Navigate to: http://localhost:6006/?path=/story/badge--default
      2. Wait for: .sb-show-main visible (timeout: 10s)
      3. Screenshot: .sisyphus/evidence/task-6-badge-stories.png
    Expected Result: success(녹색), warning(노란/앰버), info(새 primary 틴트) 배지 확인
    Evidence: .sisyphus/evidence/task-6-badge-stories.png

  Scenario: Storybook 시각 검증 — InputField 컴포넌트
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:6006/?path=/story/inputfield--default
      2. Screenshot: .sisyphus/evidence/task-6-inputfield-stories.png
    Expected Result: 웜 그레이 배경, 새 error 컬러 확인
    Evidence: .sisyphus/evidence/task-6-inputfield-stories.png

  Scenario: Storybook 시각 검증 — DatePicker 컴포넌트
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:6006/?path=/story/datepicker--default
      2. Screenshot: .sisyphus/evidence/task-6-datepicker-stories.png
    Expected Result: 웜 그레이 테마, blue 선택일 확인
    Evidence: .sisyphus/evidence/task-6-datepicker-stories.png
  ```

  **Evidence to Capture:**
  - [ ] .sisyphus/evidence/task-6-button-stories.png
  - [ ] .sisyphus/evidence/task-6-badge-stories.png
  - [ ] .sisyphus/evidence/task-6-inputfield-stories.png
  - [ ] .sisyphus/evidence/task-6-datepicker-stories.png
  - [ ] 빌드 로그 캡처

  **Commit**: NO (검증만)

---

## Commit Strategy

| After Task | Message                                                      | Files                                                                             | Verification    |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------- |
| 2          | `design: 컬러 시스템 전면 교체 — 삼일교회 브랜드 레드 기반`  | theme.css                                                                         | pnpm type-check |
| 3+4+5      | `refactor: DatePicker, SVG 아이콘, Badge 하드코딩 색상 정리` | DatePickerStyles.css, icon-input-error.svg, icon-input-reset.svg, badge/index.tsx | pnpm build:ds   |

---

## Success Criteria

### Verification Commands

```bash
# 빌드 성공
pnpm build:ds && pnpm build:admin && pnpm build:app  # Expected: exit 0

# 타입 체크
pnpm type-check  # Expected: exit 0

# 토큰 완전성
grep -c "color-primary-" packages/client/design-system/src/styles/theme.css  # Expected: 9
grep -c "color-warning-" packages/client/design-system/src/styles/theme.css  # Expected: 9

# 이전 색상 잔존 없음
grep "#EBBB13" packages/client/design-system/src/assets/icons/icon-input-error.svg  # Expected: no match
grep "#17234e" packages/client/design-system/src/styles/theme.css  # Expected: no match

# DatePicker 하드코딩 제거
grep -cE "#[0-9a-fA-F]{6}" packages/client/design-system/src/components/date-picker/DatePickerStyles.css  # Expected: 0

# OAuth 버튼 보존
grep "#FEE500" packages/client/missionary-admin/src/app/login/page.tsx  # Expected: match

# Badge warning 정상화
grep "warning:" packages/client/design-system/src/components/badge/index.tsx | grep "warning-"  # Expected: match
```

### Final Checklist

- [ ] 모든 "Must Have" 충족
- [ ] 모든 "Must NOT Have" 위반 없음
- [ ] 4개 빌드 (ds, admin, app, type-check) 성공
- [ ] Storybook 주요 컴포넌트 스크린샷 확보
- [ ] 2개 커밋 생성 완료
