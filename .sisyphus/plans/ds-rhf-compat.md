# 디자인 시스템 React Hook Form 호환성 개선

## TL;DR

> **Quick Summary**: 디자인 시스템 폼 컴포넌트들을 React Hook Form의 `register()` 패턴과 Controller `{...field}` 스프레드로 간결하게 사용할 수 있도록 내부 API를 리팩토링한다. DS는 RHF에 의존하지 않는다.
>
> **Deliverables**:
>
> - Checkbox, Radio, Switch: `{...register('name')}` 직접 사용 가능하도록 수정
> - DatePicker: Controller `{...field}` 스프레드 지원 (`selected` → `value` alias, name/onBlur/ref 전달)
> - Select: Controller `{...field}` 스프레드 지원 (onBlur/name/ref 추가)
> - DS에 Vitest 테스트 인프라 구축 + RHF 호환성 테스트
> - MissionForm.tsx 사용처 업데이트
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 5/6 → Task 7 → Task 8 → Task 9

---

## Context

### Original Request

디자인 시스템 폼 컴포넌트가 React Hook Form과 호환이 잘 안 되어, 사용하는 쪽에서 `Controller`로 감싸서 사용하고 있다. Controller가 아닌 `register()` 기본 사용법으로 사용하고 싶다.

### Interview Summary

**Key Discussions**:

- DatePicker, Select이 가장 큰 pain point이나, 모든 폼 컴포넌트가 `{...register('name')}` 패턴으로 사용 가능해야 함
- Breaking Change 허용 — 기존 API 호환성 유지 불필요
- DS는 RHF에 대한 의존성 없이 유지해야 함
- Select/DatePicker는 네이티브 input이 없어 register() 불가 → Controller 유지하되 `{...field}` 스프레드가 바로 동작하도록 API 개선
- 테스트 포함 (Vitest + React Testing Library)

**Research Findings**:

- InputField은 이미 register() 호환 (extends InputHTMLAttributes, 네이티브 input 직접 렌더)
- Checkbox/Radio/Switch: `onChange: (checked: boolean) => void` + hidden readOnly input + div click handler → register() 불가
- Select: compound component (Context), 네이티브 input 없음 → register() 근본적 불가
- DatePicker: react-datepicker 래퍼, `selected` prop (Date), `customInputRef` 오용 → register() 근본적 불가
- Checkbox/Radio/Switch의 Context export는 앱에서 소비하는 곳이 **0곳** (안전하게 변경 가능)
- DS에 vitest.config.ts 있으나 vitest 패키지 미설치, test script 없음, 테스트 파일 0개
- react-datepicker v9의 `value`는 **string** 타입 (display override용), `selected`는 Date → 이름만 바꾸면 타입 충돌

### Metis Review

**Identified Gaps** (addressed):

- **DatePicker `value` 타입 충돌**: react-datepicker의 `value`는 string이나 Controller의 `field.value`는 Date. DatePicker 래퍼에서 `value` prop을 받아 내부적으로 `selected`로 변환하고, react-datepicker에 `value`를 전달하지 않도록 처리
- **`customInputRef` 오용**: 현재 `customInputRef={ref as any}`는 잘못된 사용법. react-datepicker에서 ref를 올바르게 전달하도록 수정
- **`[key: string]: any` 제거**: DatePicker 인터페이스의 index signature 제거로 타입 안전성 확보
- **hidden → sr-only**: `className="hidden"`은 RHF `setFocus()` 차단. `sr-only`로 변경
- **Ref 머징 필요**: Checkbox/Radio/Switch가 내부 ref (click 트리거용)와 외부 ref (register용)를 동시에 사용해야 함 → `useMergeRefs` 유틸리티 생성
- **Double-fire 방지**: div click → `inputRef.click()` 호출 시 직접 onChange 호출 제거, native input의 change event에만 의존
- **Switch 인터페이스**: Checkbox/Radio는 `Omit<HTMLProps, 'onChange'>` 확장하나 Switch는 plain interface → HTMLProps 확장으로 통일

---

## Work Objectives

### Core Objective

디자인 시스템 폼 컴포넌트의 이벤트 시그니처와 ref 처리를 표준 HTML 패턴으로 정렬하여, React Hook Form의 `register()`와 Controller `{...field}` 스프레드가 자연스럽게 동작하도록 한다.

### Concrete Deliverables

- `Checkbox`, `Radio`, `Switch`: `{...register('field')}` 직접 사용 가능
- `DatePicker`: `{...field}` 스프레드로 Controller 보일러플레이트 제거
- `Select`: `{...field}` 스프레드 지원 (onBlur, name, ref 추가)
- `useMergeRefs` 유틸리티 훅
- DS package.json에 test script + vitest 관련 패키지 설치
- 각 컴포넌트별 RHF 호환성 테스트
- MissionForm.tsx 업데이트

### Definition of Done

- [x] `pnpm --filter @samilhero/design-system test` → exit code 0
- [x] `pnpm type-check` → exit code 0
- [x] `pnpm build:ds` → exit code 0
- [x] `pnpm build:admin` → exit code 0
- [x] `grep -r "react-hook-form" packages/client/design-system/src/` → 0 matches (devDep only)

### Must Have

- Checkbox/Radio/Switch의 onChange가 네이티브 `React.ChangeEvent<HTMLInputElement>` 사용
- DatePicker가 `value` prop으로 Date를 받아 내부적으로 `selected`로 변환
- Select에 `onBlur`, `name`, `ref` prop 추가
- Hidden input → sr-only 변경 (Checkbox/Radio/Switch)
- useMergeRefs 유틸리티 훅
- DS에서 react-hook-form이 production dependency가 아닐 것

### Must NOT Have (Guardrails)

- ❌ DS에 react-hook-form을 dependencies/peerDependencies로 추가
- ❌ CheckboxGroup, RadioGroup 수정 (scope 외)
- ❌ InputField 수정 (이미 호환)
- ❌ Form adapter hook/HOC 생성 (useFormField, withForm 등 — over-engineering)
- ❌ DS 컴포넌트에 validation props 추가 (required, min, pattern — RHF가 처리)
- ❌ Select에 hidden input 추가하여 register() 지원 시도 (너무 큰 설계 변경)
- ❌ Storybook stories 업데이트 (빌드 깨지지 않는 한)
- ❌ 수정하지 않은 컴포넌트에 테스트 작성
- ❌ useControllableState 훅 시그니처 변경

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: 부분적 (vitest.config.ts 있으나 vitest 패키지 미설치, test script 없음)
- **Automated tests**: YES (Tests-after) — 컴포넌트 수정 후 테스트 작성
- **Framework**: Vitest + @testing-library/react + @testing-library/user-event

### Agent-Executed QA Scenarios

**Verification Tool by Deliverable Type:**

| Type           | Tool          | How Agent Verifies                      |
| -------------- | ------------- | --------------------------------------- |
| Component 수정 | Bash (vitest) | 테스트 실행, assertion 확인             |
| 빌드 검증      | Bash (pnpm)   | build:ds, build:admin, type-check       |
| RHF 비의존성   | Bash (grep)   | src/ 내 react-hook-form import 0건 확인 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Test infrastructure 구축
└── Task 2: useMergeRefs 유틸리티 생성

Wave 2 (After Wave 1):
├── Task 3: Checkbox register() 호환 (프로토타입)
├── Task 4: Radio register() 호환 (Task 3 패턴 적용)
└── Task 5: Switch register() 호환 (Task 3 패턴 적용)

Wave 3 (After Wave 1):
├── Task 6: DatePicker {...field} 스프레드 지원
└── Task 7: Select {...field} 스프레드 지원

Wave 4 (After Wave 2 + Wave 3):
├── Task 8: RHF 호환성 테스트 작성
└── Task 9: MissionForm.tsx 사용처 업데이트

Wave 5 (After Wave 4):
└── Task 10: 최종 검증 (build, type-check, test)
```

### Dependency Matrix

| Task | Depends On    | Blocks           | Can Parallelize With |
| ---- | ------------- | ---------------- | -------------------- |
| 1    | None          | 3, 4, 5, 6, 7, 8 | 2                    |
| 2    | None          | 3, 4, 5          | 1                    |
| 3    | 1, 2          | 4, 5, 8          | 6, 7                 |
| 4    | 3             | 8                | 5, 6, 7              |
| 5    | 3             | 8                | 4, 6, 7              |
| 6    | 1             | 8, 9             | 3, 4, 5, 7           |
| 7    | 1             | 8, 9             | 3, 4, 5, 6           |
| 8    | 3, 4, 5, 6, 7 | 10               | 9                    |
| 9    | 6, 7          | 10               | 8                    |
| 10   | 8, 9          | None             | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                                     |
| ---- | ------- | ------------------------------------------------------ |
| 1    | 1, 2    | category="quick" — 패키지 설치 + 간단한 유틸리티       |
| 2    | 3, 4, 5 | category="unspecified-high" — 컴포넌트 리팩토링        |
| 3    | 6, 7    | category="unspecified-high" — 컴포넌트 API 개선        |
| 4    | 8, 9    | category="unspecified-high" — 테스트 + 사용처 업데이트 |
| 5    | 10      | category="quick" — 빌드/검증                           |

---

## TODOs

- [x] 1. DS 테스트 인프라 구축

  **What to do**:
  - DS package.json에 vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom을 devDependencies로 설치
  - react-hook-form을 devDependencies로 설치 (테스트 전용 — src/에서 import 금지)
  - package.json scripts에 `"test": "vitest run"`, `"test:watch": "vitest"` 추가
  - vitest.setup.ts에 `@testing-library/jest-dom` import 추가
  - 검증: `pnpm --filter @samilhero/design-system test` 실행 → exit code 0 (테스트 파일 없어도 에러 없이 종료)

  **Must NOT do**:
  - react-hook-form을 dependencies나 peerDependencies에 추가하지 않음
  - 기존 vitest.config.ts의 alias 설정을 변경하지 않음

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 패키지 설치와 설정 파일 수정만으로 완료되는 단순 작업
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: UI 작업 아님

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6, 7, 8
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `packages/client/design-system/vitest.config.ts` — 기존 Vitest 설정. alias, jsdom environment, globals: true, setupFiles 경로 확인
  - `packages/client/design-system/vitest.setup.ts` — 기존 setup 파일. SVG mock만 있음. 여기에 jest-dom import 추가
  - `packages/client/missionary-admin/src/test/setup.ts` — admin의 test setup 패턴 참고 (jest-dom import 패턴)

  **API/Type References**:
  - `packages/client/design-system/package.json:36-43` — scripts 섹션. test/test:watch 추가 위치
  - `packages/client/design-system/package.json:49-73` — devDependencies 섹션. 여기에 vitest 등 추가

  **Acceptance Criteria**:
  - [ ] `packages/client/design-system/package.json`의 devDependencies에 vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, react-hook-form 존재
  - [ ] `packages/client/design-system/package.json`의 scripts에 `test`, `test:watch` 존재
  - [ ] `packages/client/design-system/package.json`의 dependencies와 peerDependencies에 react-hook-form이 **없음**
  - [ ] `pnpm --filter @samilhero/design-system test` → exit code 0

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Vitest 실행 가능 확인
    Tool: Bash
    Preconditions: pnpm install 완료
    Steps:
      1. pnpm --filter @samilhero/design-system test
      2. Assert: exit code 0
      3. Assert: stdout에 "vitest" 관련 출력 존재
    Expected Result: Vitest가 정상 실행됨 (테스트 0개여도 에러 없음)
    Evidence: Terminal output captured

  Scenario: react-hook-form이 production 코드에 없음 확인
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. grep -r "react-hook-form" packages/client/design-system/src/ || true
      2. Assert: 0 matches
    Expected Result: src/ 내에 react-hook-form import 없음
    Evidence: grep output captured
  ```

  **Commit**: YES
  - Message: `chore(design-system): 테스트 인프라 구축 (vitest + RTL)`
  - Files: `packages/client/design-system/package.json`, `packages/client/design-system/vitest.setup.ts`, `pnpm-lock.yaml`
  - Pre-commit: `pnpm --filter @samilhero/design-system test`

---

- [x] 2. useMergeRefs 유틸리티 훅 생성

  **What to do**:
  - `packages/client/design-system/src/hooks/useMergeRefs.ts` 생성
  - 여러 ref를 하나로 합치는 유틸리티. React 19의 ref callback 패턴 사용
  - hooks/index.ts에 export 추가
  - 구현:
    ```typescript
    export function useMergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
      return useCallback((node: T | null) => {
        refs.forEach((ref) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref && typeof ref === 'object') {
            (ref as React.MutableRefObject<T | null>).current = node;
          }
        });
      }, refs);
    }
    ```
  - Checkbox/Radio/Switch에서 사용: 외부 ref (register/Controller)와 내부 ref (input.click() 트리거)를 머지

  **Must NOT do**:
  - 외부 라이브러리로 해결하지 않음 (직접 구현)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 유틸리티 함수 생성
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/hooks/useControllableState.tsx` — 기존 hook 패턴 참고 (export 방식, 파일 구조)
  - `packages/client/design-system/src/hooks/useEvent.ts` — 기존 hook export 패턴

  **Acceptance Criteria**:
  - [ ] `packages/client/design-system/src/hooks/useMergeRefs.ts` 파일 존재
  - [ ] hooks barrel export(index.ts)에서 `useMergeRefs` export
  - [ ] `pnpm type-check` → 에러 없음

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: useMergeRefs 타입 체크 통과
    Tool: Bash
    Preconditions: 파일 생성 완료
    Steps:
      1. pnpm type-check
      2. Assert: useMergeRefs 관련 타입 에러 없음
    Expected Result: 타입 체크 통과
    Evidence: Terminal output captured
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(design-system): useMergeRefs 유틸리티 훅 추가`
  - Files: `packages/client/design-system/src/hooks/useMergeRefs.ts`, `packages/client/design-system/src/hooks/index.ts`
  - Pre-commit: `pnpm type-check`

---

- [x] 3. Checkbox — register() 호환 리팩토링 (프로토타입)

  **What to do**:
  이 태스크가 Radio/Switch의 프로토타입이 된다. 패턴을 여기서 확립한다.

  **3-1. Props 인터페이스 변경**:
  - `onChange` 시그니처를 `(checked: boolean) => void`에서 `(e: React.ChangeEvent<HTMLInputElement>) => void`로 변경
  - `Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>` 확장 유지 (기존 패턴)
  - `onBlur?: React.FocusEventHandler<HTMLInputElement>` 추가 (register()가 전달하는 prop)

  **3-2. Hidden input 변경**:
  - `className="hidden"` → `className="sr-only"` (Tailwind: position:absolute, clip 등으로 시각적으로 숨기지만 접근성/포커스 유지)
  - `readOnly` 제거 — 네이티브 input이 실제로 change event를 발생시켜야 함
  - `onBlur` prop 전달 추가
  - `onChange` 핸들러 연결: 네이티브 change event 발생 시 외부 onChange 호출

  **3-3. Ref 머징**:
  - `useMergeRefs(ref, internalRef)` 사용
  - `internalRef`는 div 클릭 시 `internalRef.current?.click()` 호출에 사용

  **3-4. 이벤트 흐름 변경** (Double-fire 방지):
  - div click → `internalRef.current?.click()` (네이티브 input의 click 트리거)
  - input의 네이티브 `onChange` 이벤트 발생 → 여기서 state 업데이트 + 외부 onChange 호출
  - 기존 handleClick에서 직접 `onChange?.(!checked)` 호출 제거

  **3-5. Context 업데이트**:
  - `CheckboxActionsContext`의 `onChange` 타입도 `(e: React.ChangeEvent<HTMLInputElement>) => void`로 변경
  - 또는 Context를 통해서는 checked boolean만 전달하되, 외부 onChange와 분리

  **3-6. CheckboxGroup 호환성**:
  - CheckboxGroup 내부에서 Checkbox를 사용할 때, `updateCheckedValue`는 기존대로 `value` string 기반으로 동작
  - Checkbox의 handleClick에서 `groupActions.updateCheckedValue?.(value)` 호출은 유지
  - CheckboxGroup 자체는 수정하지 않음

  **Must NOT do**:
  - CheckboxGroup 수정
  - useControllableState 훅 시그니처 변경
  - 렌더링 결과물(visual div 구조) 변경

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 이벤트 흐름 변경, ref 머징, context 타입 변경 등 복합적 리팩토링
  - **Skills**: [`client-code-quality`]
    - `client-code-quality`: 컴포넌트 내부 로직 리팩토링 시 가독성/예측가능성 원칙 적용

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2 시작)
  - **Blocks**: Tasks 4, 5, 8
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/input-field/index.tsx` — **핵심 참조**. register() 호환 컴포넌트의 모범 패턴. InputHTMLAttributes 확장, 네이티브 input에 ref/onChange/onBlur 전달, `{...rest}`로 나머지 props 전달
  - `packages/client/design-system/src/components/checkbox/index.tsx` — 현재 Checkbox 구현. 전체 파일을 읽고 변경점 파악

  **API/Type References**:
  - `packages/client/design-system/src/hooks/useControllableState.tsx` — controlled/uncontrolled 상태 관리. `onChange: (value: T) => void` 시그니처. Checkbox에서는 더 이상 boolean을 직접 전달하지 않고, change event에서 `e.target.checked`를 추출하여 전달
  - `packages/client/design-system/src/hooks/useMergeRefs.ts` — Task 2에서 생성. ref 머징에 사용
  - `packages/client/design-system/src/components/checkbox-group/index.tsx:45-58` — CheckboxGroup의 updateCheckedValue. Checkbox 변경 시 이 호출이 여전히 동작하는지 확인
  - `packages/client/design-system/src/components/checkbox-group/checkboxGroupContext.ts` — CheckboxGroup context 타입. Checkbox가 이 context를 소비하는 방식 확인

  **Acceptance Criteria**:
  - [ ] Checkbox의 `onChange` prop 타입이 `(e: React.ChangeEvent<HTMLInputElement>) => void`
  - [ ] 내부 `<input>`의 className이 `sr-only` (hidden 아님)
  - [ ] 내부 `<input>`에 `readOnly` 속성 없음
  - [ ] `useMergeRefs`로 외부 ref와 내부 ref 머지
  - [ ] div click → input.click() → native onChange → 외부 onChange 호출 흐름
  - [ ] `pnpm type-check` → Checkbox 관련 에러 없음
  - [ ] `pnpm build:ds` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Checkbox 타입 체크 통과
    Tool: Bash
    Preconditions: Checkbox 리팩토링 완료
    Steps:
      1. pnpm type-check
      2. Assert: exit code 0
    Expected Result: 타입 에러 없음
    Evidence: Terminal output captured

  Scenario: DS 빌드 성공
    Tool: Bash
    Preconditions: Checkbox 리팩토링 완료
    Steps:
      1. pnpm build:ds
      2. Assert: exit code 0
    Expected Result: 빌드 성공
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `refactor(design-system): Checkbox register() 호환 리팩토링`
  - Files: `packages/client/design-system/src/components/checkbox/index.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:ds`

---

- [x] 4. Radio — register() 호환 리팩토링 (Checkbox 패턴 적용)

  **What to do**:
  Task 3(Checkbox)에서 확립한 패턴을 동일하게 적용한다.

  **4-1. Props 인터페이스 변경**:
  - `onChange` 시그니처: `(checked: boolean) → (e: React.ChangeEvent<HTMLInputElement>)`
  - `onBlur` prop 추가

  **4-2. Hidden input 변경**:
  - `className="hidden"` → `className="sr-only"`
  - `readOnly` 제거
  - `onBlur`, `onChange` 핸들러 연결

  **4-3. Ref 머징**: `useMergeRefs(ref, internalRef)`

  **4-4. 이벤트 흐름**: div click → `internalRef.current?.click()` → native onChange

  **4-5. RadioGroup 호환성**:
  - RadioGroup 내부에서 Radio 사용 시 `groupActions.changeValue?.(value)` 호출 유지
  - RadioGroup 자체는 수정하지 않음

  **Must NOT do**:
  - RadioGroup 수정
  - Checkbox 패턴에서 벗어나는 독자적 구현

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Checkbox와 동일한 복합적 리팩토링이나, 패턴이 확립되어 있어 다소 단순
  - **Skills**: [`client-code-quality`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 5와 병렬 가능, Task 3 완료 후)
  - **Parallel Group**: Wave 2 (with Task 5, after Task 3)
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/checkbox/index.tsx` — **핵심 참조**. Task 3에서 수정된 Checkbox. 이 패턴을 그대로 따라야 함
  - `packages/client/design-system/src/components/radio/index.tsx` — 현재 Radio 구현. Checkbox와 거의 동일한 구조

  **API/Type References**:
  - `packages/client/design-system/src/components/radio-group/radioGroupContext.ts` — RadioGroup context. `changeValue` 호출 유지 확인
  - `packages/client/design-system/src/components/radio-group/index.tsx:44-51` — RadioGroup의 changeValue 함수. Radio 변경 후에도 정상 동작해야 함

  **Acceptance Criteria**:
  - [ ] Radio의 `onChange` prop 타입이 `(e: React.ChangeEvent<HTMLInputElement>) => void`
  - [ ] 내부 `<input>`의 className이 `sr-only`, readOnly 없음
  - [ ] `useMergeRefs` 적용
  - [ ] `pnpm type-check` → Radio 관련 에러 없음
  - [ ] `pnpm build:ds` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Radio 타입 체크 + 빌드 통과
    Tool: Bash
    Preconditions: Radio 리팩토링 완료
    Steps:
      1. pnpm type-check && pnpm build:ds
      2. Assert: exit code 0
    Expected Result: 타입 에러 없이 빌드 성공
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `refactor(design-system): Radio register() 호환 리팩토링`
  - Files: `packages/client/design-system/src/components/radio/index.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:ds`

---

- [x] 5. Switch — register() 호환 리팩토링 (Checkbox 패턴 적용)

  **What to do**:
  Task 3(Checkbox) 패턴을 동일하게 적용. Switch만의 차이점: 인터페이스가 plain custom interface임 → HTMLProps 확장으로 변경.

  **5-1. Props 인터페이스 변경**:
  - 현재: plain `SwitchProps` interface (HTMLProps 미확장)
  - 변경: `Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>` 확장으로 통일 (Checkbox/Radio와 동일)
  - `onChange` 시그니처: `(checked: boolean) → (e: React.ChangeEvent<HTMLInputElement>)`
  - `onBlur` prop이 HTMLProps 확장으로 자동 포함됨

  **5-2~5-4**: Checkbox와 동일 (hidden→sr-only, readOnly 제거, ref 머징, 이벤트 흐름)

  **Must NOT do**:
  - `focus` prop 관련 변경 (unrelated cleanup)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`client-code-quality`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 4와 병렬 가능, Task 3 완료 후)
  - **Parallel Group**: Wave 2 (with Task 4, after Task 3)
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/checkbox/index.tsx` — Task 3에서 수정된 Checkbox 패턴
  - `packages/client/design-system/src/components/switch/index.tsx` — 현재 Switch 구현. 인터페이스가 plain → HTMLProps 확장 필요

  **Acceptance Criteria**:
  - [ ] Switch의 interface가 `Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>` 확장
  - [ ] `onChange` prop 타입이 `(e: React.ChangeEvent<HTMLInputElement>) => void`
  - [ ] 내부 `<input>`의 className이 `sr-only`, readOnly 없음
  - [ ] `useMergeRefs` 적용
  - [ ] `pnpm type-check && pnpm build:ds` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Switch 타입 체크 + 빌드 통과
    Tool: Bash
    Preconditions: Switch 리팩토링 완료
    Steps:
      1. pnpm type-check && pnpm build:ds
      2. Assert: exit code 0
    Expected Result: 타입 에러 없이 빌드 성공
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `refactor(design-system): Switch register() 호환 리팩토링`
  - Files: `packages/client/design-system/src/components/switch/index.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:ds`

---

- [x] 6. DatePicker — Controller `{...field}` 스프레드 지원

  **What to do**:

  **6-1. Props 인터페이스 변경**:
  - `selected?: Date | null` 유지 (하위 호환)
  - `value?: Date | null` 추가 — `selected`의 alias. Controller의 `field.value`가 여기로 들어옴
  - `onChange` 유지: `(date: Date | null) => void` — Controller의 `field.onChange`는 raw value를 받으므로 호환됨
  - `name?: string` 추가 — ReactDatePicker에 전달
  - `onBlur?: () => void` 추가 — ReactDatePicker에 전달
  - `[key: string]: any` 인덱스 시그니처 **제거** — 타입 안전성 확보. 필요한 react-datepicker props는 명시적으로 선언
  - `ref` 처리 수정 — `customInputRef`는 잘못된 사용. react-datepicker의 ref forwarding은 다른 메커니즘 사용

  **6-2. 내부 구현 변경**:
  - `const dateValue = value ?? selected` — value가 우선, selected가 폴백
  - ReactDatePicker에 `selected={dateValue}`, `name={name}`, `onBlur={onBlur}` 전달
  - `value` prop을 ReactDatePicker에 전달하지 **않음** (react-datepicker의 value는 string 타입이라 충돌)
  - `customInputRef={ref as any}` 제거, 올바른 ref 전달 방법 사용

  **Must NOT do**:
  - react-datepicker 버전 변경
  - DatePicker의 시각적 UI 변경
  - `onChange` 시그니처를 ChangeEvent로 변경 (react-datepicker의 onChange는 Date 기반)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: react-datepicker API와의 prop 매핑 + 타입 안전성 확보가 필요한 작업
  - **Skills**: [`client-code-quality`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 3, 4, 5와 병렬)
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/date-picker/index.tsx` — 현재 DatePicker 구현 전체. `selected`, `onChange`, `customInputRef` 사용 방식 확인
  - `packages/client/design-system/src/components/input-field/index.tsx` — label, error, id, ref 처리 패턴 참고

  **API/Type References**:
  - `packages/client/design-system/src/components/date-picker/DatePickerStyles.css` — 스타일 파일. 변경 불필요하나 존재 확인

  **External References**:
  - react-datepicker v9 API: `selected` (Date), `value` (string, display override), `name` (string), `onBlur` (callback), `onChange` ((date, event?) => void)
  - react-datepicker ref: v9에서는 `ref` prop 직접 전달 가능 (ReactDatePicker 컴포넌트에 ref forwarding 지원)

  **Acceptance Criteria**:
  - [ ] DatePicker가 `value` prop (Date | null)을 받아 내부적으로 `selected`로 변환
  - [ ] DatePicker가 `name`, `onBlur` prop을 받아 ReactDatePicker에 전달
  - [ ] `[key: string]: any` 인덱스 시그니처 제거됨
  - [ ] `customInputRef` 사용 제거됨
  - [ ] Controller `{...field}` 스프레드가 타입 에러 없이 동작 (value, onChange, onBlur, name, ref 모두 수용)
  - [ ] `pnpm type-check && pnpm build:ds` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: DatePicker 타입 체크 + 빌드 통과
    Tool: Bash
    Preconditions: DatePicker 수정 완료
    Steps:
      1. pnpm type-check && pnpm build:ds
      2. Assert: exit code 0
    Expected Result: 타입 에러 없이 빌드 성공
    Evidence: Terminal output captured

  Scenario: DatePicker value prop이 react-datepicker에 전달되지 않음 확인
    Tool: Bash (grep)
    Preconditions: DatePicker 수정 완료
    Steps:
      1. 소스에서 ReactDatePicker에 value prop 전달하는 코드가 없는지 확인
      2. Assert: `value={dateValue}`가 `selected={dateValue}`로 변환되어 전달됨
    Expected Result: react-datepicker의 value(string)와 충돌 없음
    Evidence: 소스 코드 확인
  ```

  **Commit**: YES
  - Message: `refactor(design-system): DatePicker Controller {...field} 스프레드 지원`
  - Files: `packages/client/design-system/src/components/date-picker/index.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:ds`

---

- [x] 7. Select — Controller `{...field}` 스프레드 지원

  **What to do**:

  **7-1. SelectRootProps 인터페이스 확장**:
  - `onBlur?: () => void` 추가
  - `name?: string` 추가
  - `ref?: React.Ref<HTMLDivElement>` 추가

  **7-2. 내부 구현 변경**:
  - `ref`를 최상위 `<div ref={selectRef}>` 에 머지 (useMergeRefs로 외부 ref + 내부 selectRef 합침)
  - `name` prop은 hidden input이 없으므로 data attribute나 aria로 처리하거나, context를 통해 전달
  - `onBlur` 호출 시점: 드롭다운이 닫힐 때 (click-outside, option 선택). 기존 `setOpen(false)` 호출 위치에 `onBlur?.()` 추가
  - 단, option 선택 시 onBlur가 onChange보다 먼저 호출되지 않도록 순서 주의: onChange → onBlur 순서

  **Must NOT do**:
  - compound component 패턴 변경 (Select.Trigger, Select.Options, Select.Option 구조 유지)
  - 네이티브 `<select>` 요소 추가
  - SelectSearchInput 수정

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: compound component의 이벤트 타이밍과 ref 머징이 필요한 작업
  - **Skills**: [`client-code-quality`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 6과 병렬)
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/client/design-system/src/components/select/index.tsx` — 현재 Select 구현 전체. SelectRoot의 props, context, useEffect (click-outside) 확인
  - `packages/client/design-system/src/components/select/Trigger.tsx` — SelectTrigger 구현. open/close 트리거
  - `packages/client/design-system/src/components/select/SelectOption.tsx` — SelectOption의 click handler. handleSelectValue 호출 시점

  **API/Type References**:
  - `packages/client/design-system/src/components/select/SelectOptions.tsx` — Options 렌더링
  - `packages/client/design-system/src/components/select/SelectSearchInput.tsx` — SearchInput (수정 범위 밖이나 구조 이해에 참고)

  **Acceptance Criteria**:
  - [ ] SelectRootProps에 `onBlur`, `name`, `ref` 존재
  - [ ] 외부 ref와 내부 selectRef가 useMergeRefs로 머지됨
  - [ ] 드롭다운 닫힐 때 onBlur 호출 (click-outside, option 선택 시)
  - [ ] Controller `{...field}` 스프레드가 타입 에러 없이 동작
  - [ ] `pnpm type-check && pnpm build:ds` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Select 타입 체크 + 빌드 통과
    Tool: Bash
    Preconditions: Select 수정 완료
    Steps:
      1. pnpm type-check && pnpm build:ds
      2. Assert: exit code 0
    Expected Result: 타입 에러 없이 빌드 성공
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `refactor(design-system): Select Controller {...field} 스프레드 지원`
  - Files: `packages/client/design-system/src/components/select/index.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:ds`

---

- [x] 8. RHF 호환성 테스트 작성

  **What to do**:
  react-hook-form을 devDependency로 사용하여 실제 RHF와의 통합 테스트 작성.
  테스트 파일 위치: 각 컴포넌트 폴더 내 `__tests__/` 디렉토리.

  **8-1. Checkbox 테스트** (`checkbox/__tests__/Checkbox.test.tsx`):
  - register() 스프레드 → click → `form.getValues('agree')` === true
  - 다시 click → `form.getValues('agree')` === false
  - disabled 상태에서 click → 값 변경 없음
  - uncontrolled 모드 (register 없이 defaultChecked) → click → 내부 state 토글

  **8-2. Radio 테스트** (`radio/__tests__/Radio.test.tsx`):
  - register() 스프레드 + value="a" → click → `form.getValues('option')` === 'a'
  - 다른 Radio click → 값 변경 확인
  - disabled 상태 → 변경 없음

  **8-3. Switch 테스트** (`switch/__tests__/Switch.test.tsx`):
  - register() 스프레드 → click → `form.getValues('toggle')` === true
  - disabled 상태 → 변경 없음

  **8-4. DatePicker 테스트** (`date-picker/__tests__/DatePicker.test.tsx`):
  - Controller `{...field}` 스프레드 → TypeScript 에러 없이 렌더링
  - value prop으로 Date 전달 → 해당 날짜가 표시됨
  - name prop이 내부 input에 전달되는지 확인

  **8-5. Select 테스트** (`select/__tests__/Select.test.tsx`):
  - Controller `{...field}` 스프레드 → TypeScript 에러 없이 렌더링
  - option 선택 → field.onChange 호출 확인
  - 드롭다운 닫힐 때 onBlur 호출 확인

  **Must NOT do**:
  - DS src/ 코드에서 react-hook-form import
  - 수정하지 않은 컴포넌트 테스트 (InputField 등)
  - E2E/통합 테스트 (단위 테스트만)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 여러 컴포넌트에 대한 테스트 작성, RHF 통합 패턴 이해 필요
  - **Skills**: [`client-code-quality`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 9와 병렬)
  - **Parallel Group**: Wave 4 (with Task 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 4, 5, 6, 7

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/login/__tests__/LoginPage.test.tsx` — **핵심 참조**. 기존 프로젝트의 테스트 패턴. render, screen, fireEvent, waitFor, vi.clearAllMocks 사용법
  - `packages/client/missionary-admin/src/app/login/schemas/__tests__/loginSchema.test.ts` — Vitest describe/it/expect 패턴

  **Test References**:
  - `packages/client/design-system/vitest.config.ts` — jsdom environment, globals: true (import 없이 describe/it/expect 사용 가능)
  - `packages/client/design-system/vitest.setup.ts` — setup 파일 (jest-dom matchers 포함 — Task 1에서 추가됨)

  **External References**:
  - @testing-library/react: `render`, `screen`, `fireEvent`, `waitFor`
  - @testing-library/user-event: `userEvent.setup()`, `user.click()` 패턴
  - react-hook-form 테스트 패턴: `useForm` + `FormProvider` or `Controller` in test wrapper

  **Acceptance Criteria**:
  - [ ] `packages/client/design-system/src/components/checkbox/__tests__/Checkbox.test.tsx` 존재
  - [ ] `packages/client/design-system/src/components/radio/__tests__/Radio.test.tsx` 존재
  - [ ] `packages/client/design-system/src/components/switch/__tests__/Switch.test.tsx` 존재
  - [ ] `packages/client/design-system/src/components/date-picker/__tests__/DatePicker.test.tsx` 존재
  - [ ] `packages/client/design-system/src/components/select/__tests__/Select.test.tsx` 존재
  - [ ] `pnpm --filter @samilhero/design-system test` → 모든 테스트 PASS
  - [ ] react-hook-form import가 테스트 파일에만 존재 (src/components/\*\*/\_\_tests\_\_/ 내)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 모든 DS 테스트 통과
    Tool: Bash
    Preconditions: 모든 테스트 파일 작성 완료
    Steps:
      1. pnpm --filter @samilhero/design-system test
      2. Assert: exit code 0
      3. Assert: stdout에 모든 test suites PASS
    Expected Result: 모든 테스트 통과
    Evidence: Terminal output captured

  Scenario: react-hook-form이 src 코드에 없음 확인
    Tool: Bash (grep)
    Preconditions: 테스트 작성 완료
    Steps:
      1. src/ 내에서 __tests__ 디렉토리를 제외한 파일에서 react-hook-form import 검색
      2. Assert: 0 matches
    Expected Result: production 코드에 RHF 의존성 없음
    Evidence: grep output captured
  ```

  **Commit**: YES
  - Message: `test(design-system): RHF 호환성 테스트 추가`
  - Files: `packages/client/design-system/src/components/*/__tests__/*.test.tsx`
  - Pre-commit: `pnpm --filter @samilhero/design-system test`

---

- [x] 9. MissionForm.tsx 사용처 업데이트

  **What to do**:
  DatePicker와 Select의 새 API를 활용하여 MissionForm의 Controller 보일러플레이트를 줄인다.

  **9-1. DatePicker 사용 간소화** (4곳):

  ```tsx
  // Before:
  <Controller
    name="startDate"
    control={form.control}
    render={({ field }) => (
      <DatePicker
        label="선교 시작일"
        selected={field.value}
        onChange={field.onChange}
        placeholder="YYYY-MM-DD"
        error={form.formState.errors.startDate?.message}
        disabled={isPending}
      />
    )}
  />

  // After:
  <Controller
    name="startDate"
    control={form.control}
    render={({ field }) => (
      <DatePicker
        {...field}
        label="선교 시작일"
        placeholder="YYYY-MM-DD"
        error={form.formState.errors.startDate?.message}
        disabled={isPending}
      />
    )}
  />
  ```

  **9-2. Select 사용 간소화**:

  ```tsx
  // Before:
  <Controller
    name="regionId"
    control={form.control}
    render={({ field }) => (
      <Select value={field.value} onChange={field.onChange}>
        ...
      </Select>
    )}
  />

  // After:
  <Controller
    name="regionId"
    control={form.control}
    render={({ field }) => (
      <Select {...field}>
        ...
      </Select>
    )}
  />
  ```

  **9-3. minDate 처리**:
  endDate, participationEndDate의 `minDate` prop은 `{...field}` 스프레드 외에 별도로 전달.

  **Must NOT do**:
  - 새로운 폼 필드 추가
  - MissionForm 이외의 파일 수정
  - form validation 로직 변경

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 패턴 적용만으로 완료되는 간단한 사용처 업데이트
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 8과 병렬)
  - **Parallel Group**: Wave 4 (with Task 8)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 6, 7

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/(admin)/missions/components/MissionForm.tsx` — **핵심 참조**. 전체 파일. 4개 DatePicker Controller + 1개 Select Controller 위치 확인

  **Acceptance Criteria**:
  - [ ] MissionForm의 모든 DatePicker Controller가 `{...field}` 스프레드 사용
  - [ ] MissionForm의 Select Controller가 `{...field}` 스프레드 사용
  - [ ] `selected={field.value}`, `onChange={field.onChange}` 수동 매핑 코드 제거됨
  - [ ] `pnpm type-check` → MissionForm 관련 에러 없음
  - [ ] `pnpm build:admin` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: MissionForm 타입 체크 + Admin 빌드 통과
    Tool: Bash
    Preconditions: MissionForm 업데이트 완료
    Steps:
      1. pnpm type-check
      2. Assert: exit code 0
      3. pnpm build:admin
      4. Assert: exit code 0
    Expected Result: 타입 에러 없이 빌드 성공
    Evidence: Terminal output captured

  Scenario: selected={field.value} 패턴이 MissionForm에서 제거됨
    Tool: Bash (grep)
    Preconditions: MissionForm 업데이트 완료
    Steps:
      1. grep "selected={field" packages/client/missionary-admin/src/app/(admin)/missions/components/MissionForm.tsx || true
      2. Assert: 0 matches
    Expected Result: 수동 매핑 코드 없음
    Evidence: grep output captured
  ```

  **Commit**: YES
  - Message: `refactor(admin): MissionForm Controller {...field} 스프레드 적용`
  - Files: `packages/client/missionary-admin/src/app/(admin)/missions/components/MissionForm.tsx`
  - Pre-commit: `pnpm type-check && pnpm build:admin`

---

- [x] 10. 최종 검증

  **What to do**:
  모든 수정이 완료된 후 전체 프로젝트 빌드 + 테스트 + 타입 체크 통과 확인.
  - `pnpm --filter @samilhero/design-system test` → 모든 테스트 PASS
  - `pnpm type-check` → 에러 없음
  - `pnpm build:ds` → 성공
  - `pnpm build:admin` → 성공
  - DS src/에 react-hook-form import 없음 확인

  **Must NOT do**:
  - 코드 수정 (검증만)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 커맨드 실행만으로 완료
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5, final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 8, 9

  **References**: None needed (commands only)

  **Acceptance Criteria**:
  - [ ] `pnpm --filter @samilhero/design-system test` → exit code 0
  - [ ] `pnpm type-check` → exit code 0
  - [ ] `pnpm build:ds` → exit code 0
  - [ ] `pnpm build:admin` → exit code 0
  - [ ] DS src/에서 `__tests__/` 제외 react-hook-form import → 0건

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 프로젝트 검증
    Tool: Bash
    Preconditions: 모든 태스크 완료
    Steps:
      1. pnpm --filter @samilhero/design-system test
      2. Assert: exit code 0, 모든 테스트 PASS
      3. pnpm type-check
      4. Assert: exit code 0
      5. pnpm build:ds
      6. Assert: exit code 0
      7. pnpm build:admin
      8. Assert: exit code 0
    Expected Result: 전체 검증 통과
    Evidence: Terminal output captured for each command

  Scenario: RHF 비의존성 최종 확인
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. grep -r "from ['\"]react-hook-form" packages/client/design-system/src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" || true
      2. Assert: 0 matches
    Expected Result: production 코드에 RHF import 없음
    Evidence: grep output captured
  ```

  **Commit**: NO (검증만)

---

## Commit Strategy

| After Task | Message                                                                   | Files                                         | Verification                        |
| ---------- | ------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------- |
| 1          | `chore(design-system): 테스트 인프라 구축 (vitest + RTL)`                 | package.json, vitest.setup.ts, pnpm-lock.yaml | pnpm test                           |
| 2          | `feat(design-system): useMergeRefs 유틸리티 훅 추가`                      | hooks/useMergeRefs.ts, hooks/index.ts         | pnpm type-check                     |
| 3          | `refactor(design-system): Checkbox register() 호환 리팩토링`              | checkbox/index.tsx                            | pnpm type-check && pnpm build:ds    |
| 4          | `refactor(design-system): Radio register() 호환 리팩토링`                 | radio/index.tsx                               | pnpm type-check && pnpm build:ds    |
| 5          | `refactor(design-system): Switch register() 호환 리팩토링`                | switch/index.tsx                              | pnpm type-check && pnpm build:ds    |
| 6          | `refactor(design-system): DatePicker Controller {...field} 스프레드 지원` | date-picker/index.tsx                         | pnpm type-check && pnpm build:ds    |
| 7          | `refactor(design-system): Select Controller {...field} 스프레드 지원`     | select/index.tsx                              | pnpm type-check && pnpm build:ds    |
| 8          | `test(design-system): RHF 호환성 테스트 추가`                             | _/**tests**/_.test.tsx                        | pnpm test                           |
| 9          | `refactor(admin): MissionForm Controller {...field} 스프레드 적용`        | MissionForm.tsx                               | pnpm type-check && pnpm build:admin |

---

## Success Criteria

### Verification Commands

```bash
pnpm --filter @samilhero/design-system test  # Expected: All tests pass
pnpm type-check                                # Expected: exit code 0
pnpm build:ds                                  # Expected: exit code 0
pnpm build:admin                               # Expected: exit code 0
```

### Final Checklist

- [x] Checkbox/Radio/Switch: `{...register('field')}` 직접 사용 가능
- [x] DatePicker: Controller `{...field}` 스프레드로 사용 가능
- [x] Select: Controller `{...field}` 스프레드로 사용 가능
- [x] DS에 react-hook-form production dependency 없음
- [x] 모든 테스트 통과
- [x] 모든 빌드 통과
- [x] MissionForm.tsx에서 수동 prop 매핑 제거됨
