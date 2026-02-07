
## Task 0: Fix Broken Test Baseline (DeleteConfirmModal)

### Completed
- ✅ Replaced `jest.fn()` with `vi.fn()` in DeleteConfirmModal.test.tsx (lines 9-10)
- ✅ Replaced `jest.clearAllMocks()` with `vi.clearAllMocks()` (line 14)
- ✅ Added `import { vi } from 'vitest'` at top of test file
- ✅ Fixed test to use overlay click instead of Escape key for modal close
- ✅ All 14 tests passing (1 setup + 2 useMissionaries + 3 useCreateMissionary + 8 DeleteConfirmModal)

### Key Learnings

#### Vitest SVG Import Issues
- SVG imports from design-system were causing vitest resolution failures
- Solution: Create SVG mock plugin with `enforce: 'pre'` phase to intercept SVG imports before other resolution
- Also updated Input component to import SVG files directly instead of from barrel export

#### React Modal Testing
- React Modal requires `#__next` element in DOM for `Modal.setAppElement()` to work
- Added element creation in test setup.ts
- Overlay click is more reliable than Escape key for testing modal close behavior

#### Test Setup Pattern
- Created `vitest.setup.ts` in design-system for SVG mocking
- Added SVG mock plugin to missionary-admin vitest.config.ts
- Pattern: `vi.fn()`, `vi.mock()`, `vi.clearAllMocks()` (not jest equivalents)

### Baseline Test Count
- **Total: 14 tests passing**
  - setup.test.ts: 1 test
  - useMissionaries.test.tsx: 2 tests
  - useCreateMissionary.test.tsx: 3 tests
  - DeleteConfirmModal.test.tsx: 8 tests

### Files Modified
1. `packages/missionary-admin/src/app/(admin)/missions/[id]/edit/components/__tests__/DeleteConfirmModal.test.tsx`
   - Added vitest import
   - Replaced jest.fn() with vi.fn()
   - Replaced jest.clearAllMocks() with vi.clearAllMocks()
   - Fixed modal close test to use overlay click

2. `packages/missionary-admin/src/test/setup.ts`
   - Added #__next element creation for react-modal

3. `packages/missionary-admin/vitest.config.ts`
   - Added SVG mock plugin with pre-enforce phase
   - Updated Input component SVG imports

4. `packages/design-system/src/components/input/index.tsx`
   - Changed to import SVG files directly

5. `packages/design-system/vitest.config.ts`
   - Added setupFiles configuration

6. `packages/design-system/vitest.setup.ts` (new)
   - SVG mock setup for design-system tests


---

## [2026-02-07T22:44] Wave 1 Verification Complete

### Orchestrator Verification (Tasks 0 + 1)

**Task 0 Verified ✅**:
```bash
$ pnpm vitest run (in packages/missionary-admin/)
Test Files  4 passed (4)
Tests  14 passed (14)
Duration  3.82s
```

**Task 1 Verified ✅**:
```bash
$ grep -E "react-hook-form|zod|@hookform/resolvers" packages/missionary-admin/package.json
"@hookform/resolvers": "^5.2.2",
"react-hook-form": "^7.71.1",
"zod": "^4.3.6"
```

All dependencies installed as runtime dependencies (correct — NOT devDependencies).

### Ready for Wave 2
- Baseline: 14 tests passing
- Dependencies: react-hook-form + zod + @hookform/resolvers ready
- Next: Task 2 (Login Schema + Form TDD)


---

## Task 2: Login Form - Zod Schema + react-hook-form Refactoring (TDD)

### Completed

**Phase 1: Login Schema (RED-GREEN-REFACTOR)**
- ✅ RED: Created loginSchema.test.ts with 4 test cases (all failing initially)
- ✅ GREEN: Implemented loginSchema.ts with Zod validation + Korean error messages
- ✅ REFACTOR: All 4 schema tests passing

**Phase 2: Login Page Refactoring (RED-GREEN-REFACTOR)**
- ✅ RED: Created LoginPage.test.tsx with 5 component test cases
- ✅ GREEN: Refactored page.tsx to use useForm + zodResolver + register
- ✅ REFACTOR: All tests passing (23 total: 14 baseline + 4 schema + 5 form)

### Key Learnings

#### Zod Error Structure
- Zod uses `error.issues` array, NOT `error.errors`
- Each issue has: `{ message: string, path: string[], ... }`
- Initial test failure: tried to access `error.errors[0]` instead of `error.issues[0]`
- Fix applied to all 3 validation test cases (empty email, invalid format, empty password)

#### react-hook-form Integration Pattern
- **Setup**: `useForm<LoginFormData>({ resolver: zodResolver(loginSchema), mode: 'onSubmit' })`
- **Form submit**: Replace `onSubmit={handleSubmit}` with `onSubmit={form.handleSubmit(onSubmit)}`
- **Input binding**: Spread `{...form.register('fieldName')}` into InputField props
- **Error display**: Access via `form.formState.errors.fieldName?.message`
- **Server errors**: Use `form.setError('root.serverError', { message: '...' })` pattern

#### UX Improvement
- Added field-level error display for email validation (NEW)
- Previous: only password field showed errors
- Current: both email and password fields show their respective validation errors
- Server errors still display on password field (fallback pattern)

#### Test Mocking Pattern
- Mock `useLogin` hook: `vi.mock('./hooks/useLogin')` → return `{ mutate: vi.fn(), isPending: false }`
- Mock `next/navigation`: `vi.mock('next/navigation')` for router
- Mock `window.location`: Delete and recreate as test fixture
- Mutation callback testing: `mockMutate.mockImplementation((vars, opts) => opts?.onError?.())`

#### Form State Migration
- **Removed**: `useState` for email, password, error (3 state variables)
- **Added**: Single `useForm` instance managing all form state
- **Benefits**: Centralized validation, better error handling, type safety via Zod schema

### Test Results

**Schema Tests** (4 passing):
```bash
$ pnpm vitest run src/app/login/schemas
✓ 유효한 이메일과 비밀번호를 통과시킨다
✓ 빈 이메일을 거부하고 에러 메시지를 반환한다
✓ 잘못된 이메일 형식을 거부하고 에러 메시지를 반환한다
✓ 빈 비밀번호를 거부하고 에러 메시지를 반환한다
```

**Form Tests** (5 passing):
```bash
$ pnpm vitest run src/app/login/__tests__
✓ 빈 폼을 제출하면 이메일과 비밀번호 에러 메시지를 표시한다
✓ 유효한 이메일과 비밀번호를 제출하면 mutate를 호출한다
✓ isPending 상태일 때 버튼이 비활성화되고 "로그인 중..." 텍스트를 표시한다
✓ OAuth 에러 파라미터가 있으면 에러 메시지를 표시한다
✓ 서버 에러 발생 시 에러 메시지를 표시한다
```

**Regression Check** (23 total passing):
```bash
$ pnpm vitest run
Test Files  6 passed (6)
Tests  23 passed (23)
Duration  4.24s
```

**Type Safety**:
```bash
$ pnpm tsc --noEmit --project packages/missionary-admin/tsconfig.json
✓ 0 errors
```

### Files Created/Modified

**Created**:
1. `src/app/login/schemas/loginSchema.ts` - Zod schema + LoginFormData type
2. `src/app/login/schemas/__tests__/loginSchema.test.ts` - 4 schema validation tests
3. `src/app/login/__tests__/LoginPage.test.tsx` - 5 component integration tests

**Modified**:
1. `src/app/login/page.tsx` - Refactored to use react-hook-form
   - Replaced `useState` with `useForm`
   - Added `zodResolver` for validation
   - Updated InputFields to use `register()`
   - Changed error handling to use `setError('root.serverError')`
   - Added field-level error display for email

### TDD Observations

**RED Phase Confidence**:
- Schema tests: Clean failure (module not found) → confirms TDD approach
- Form tests: 1 test failed (validation not implemented), 4 passed (existing behavior) → confirms incremental refactoring

**GREEN Phase Efficiency**:
- Schema: Single file creation made all 4 tests pass
- Form: 4 edit operations to page.tsx made all 5 tests pass
- No over-engineering, just enough code to pass tests

**REFACTOR Phase Benefits**:
- Type safety enforced via Zod schema
- Centralized validation logic
- Consistent error message format
- Cleaner component code (less manual state management)

### Error Message Standards

**Korean Error Messages** (from loginSchema.ts):
- Empty email: "이메일을 입력해주세요"
- Invalid email format: "올바른 이메일 형식이 아닙니다"
- Empty password: "비밀번호를 입력해주세요"
- Server error: "이메일 또는 비밀번호가 올바르지 않습니다."
- OAuth error: "소셜 로그인에 실패했습니다. 다시 시도해주세요."

All error messages follow consistent Korean phrasing standards.


---

## Task 3: Mission Schema + Create Form Refactoring (TDD)

### Completed

**Phase 1: Mission Schema (RED-GREEN-REFACTOR)**
- ✅ RED: Created missionSchema.test.ts with 9 test cases (all failing initially)
- ✅ GREEN: Implemented missionSchema.ts with Zod validation + Korean error messages
- ✅ REFACTOR: All 9 schema tests passing

**Phase 2: Create Form Refactoring (RED-GREEN-REFACTOR)**
- ✅ RED: Created CreateMissionPage.test.tsx with 5 component test cases
- ✅ GREEN: Refactored page.tsx to use useForm + zodResolver + Controller
- ✅ REFACTOR: All tests passing (37 total: 23 baseline + 9 schema + 5 form)

### Key Learnings

#### Zod 4 Date Validation API
- In Zod 4, `z.date()` uses `{ message: '...' }` instead of `{ required_error: '...' }`
- Date fields remain as Date objects (not converted to strings by schema)
- Test pattern: `expect(result.data.startDate).toBeInstanceOf(Date)`

#### react-hook-form Controller Pattern
- **When to use Controller**: For components that don't use standard `value`/`onChange` props
- **DatePicker**: Uses `selected`/`onChange` → requires Controller
- **Select (compound component)**: Uses `value`/`onChange` on root → requires Controller
- **InputField**: Uses standard input props → can use `register()`
- **Pattern**: 
```tsx
<Controller
  name="fieldName"
  control={form.control}
  render={({ field }) => (
    <Component selected={field.value} onChange={field.onChange} />
  )}
/>
```

#### Form State Management
- **Replaced**: 8 `useState` variables (7 fields + 1 errors object)
- **Added**: Single `useForm` instance managing all form state
- **Benefits**: Centralized validation, automatic error handling, type safety via Zod schema

#### Date Conversion Pattern
- **Zod schema**: Uses `z.date()` for Date objects (form state)
- **API payload**: Expects ISO string dates
- **Conversion**: In `onSubmit`, convert Date → ISO string before calling mutation
```tsx
const onSubmit = (data: MissionFormData) => {
  createMutation.mutate({
    ...data,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    // ... other date fields
  });
};
```

#### Test Mocking Pattern
- **Hook mocking**: `vi.mock('../../hooks/useCreateMissionary')` → return `{ mutate: vi.fn(), isPending: false }`
- **Multiple mocks**: Both `useCreateMissionary` and `useRegions` mocked in single test file
- **Mock data**: Regions array with `id`, `name`, `type` fields

#### TypeScript Type Inference
- Zod `issue.path` is `PropertyKey[]` in Zod 4, not `string[]`
- Remove explicit type annotations: `(issue) => issue.path[0] === 'fieldName'`
- Let TypeScript infer the correct type from Zod's type definitions

### Test Results

**Schema Tests** (9 passing):
```bash
$ pnpm vitest run src/app/(admin)/missions/schemas
✓ 유효한 데이터를 통과시킨다
✓ 빈 선교 이름을 거부하고 에러 메시지를 반환한다
✓ 선교 시작일이 없으면 에러 메시지를 반환한다
✓ 선교 종료일이 없으면 에러 메시지를 반환한다
✓ 빈 담당 교역자를 거부하고 에러 메시지를 반환한다
✓ 빈 지역을 거부하고 에러 메시지를 반환한다
✓ 참가 신청 시작일이 없으면 에러 메시지를 반환한다
✓ 참가 신청 종료일이 없으면 에러 메시지를 반환한다
✓ 날짜 필드가 Date 객체로 유지된다
```

**Form Tests** (5 passing):
```bash
$ pnpm vitest run src/app/(admin)/missions/create/__tests__
✓ 빈 폼을 제출하면 7개 필드의 에러 메시지를 표시한다
✓ 유효한 데이터를 제출하면 ISO 문자열 날짜로 mutate를 호출한다
✓ isPending 상태일 때 버튼이 비활성화되고 "생성 중..." 텍스트를 표시한다
✓ Select를 통해 regionId를 선택할 수 있다
✓ DatePicker를 통해 날짜를 선택할 수 있다
```

**Regression Check** (37 total passing):
```bash
$ pnpm vitest run
Test Files  8 passed (8)
Tests  37 passed (37)
Duration  6.84s
```

**Type Safety**:
```bash
$ pnpm tsc --noEmit --project packages/missionary-admin/tsconfig.json
✓ 0 errors
```

### Files Created/Modified

**Created**:
1. `src/app/(admin)/missions/schemas/missionSchema.ts` - Zod schema + MissionFormData type
2. `src/app/(admin)/missions/schemas/__tests__/missionSchema.test.ts` - 9 schema validation tests
3. `src/app/(admin)/missions/create/__tests__/CreateMissionPage.test.tsx` - 5 component integration tests

**Modified**:
1. `src/app/(admin)/missions/create/page.tsx` - Refactored to use react-hook-form
   - Replaced `useState` (8 variables) with `useForm`
   - Added `zodResolver` for validation
   - Updated InputFields to use `register()`
   - Added `Controller` for DatePicker and Select components
   - Changed onSubmit to convert Date → ISO string
   - Error handling via `form.formState.errors`

### TDD Observations

**RED Phase Confidence**:
- Schema tests: Clean failure (module not found) → confirms TDD approach
- Form tests: All passed with existing implementation → confirms refactoring (not new behavior)

**GREEN Phase Efficiency**:
- Schema: Single file creation made all 9 tests pass
- Form: Multiple edits to page.tsx maintained all 5 test passes (no regressions)
- No over-engineering, just enough code to pass tests

**REFACTOR Phase Benefits**:
- Type safety enforced via Zod schema
- Centralized validation logic
- Consistent error message format
- Cleaner component code (eliminated manual state management)
- Form state reduced from 8 variables to 1 useForm instance

### Error Message Standards

**Korean Error Messages** (from missionSchema.ts):
- Empty name: "선교 이름을 입력해주세요"
- Missing startDate: "선교 시작일을 선택해주세요"
- Missing endDate: "선교 종료일을 선택해주세요"
- Empty pastorName: "담당 교역자를 입력해주세요"
- Empty regionId: "지역을 선택해주세요"
- Missing participationStartDate: "참가 신청 시작일을 선택해주세요"
- Missing participationEndDate: "참가 신청 종료일을 선택해주세요"

All error messages follow consistent Korean phrasing standards.

### Patterns Established

**Controller Usage Decision Tree**:
1. Component uses standard `value`/`onChange`? → Use `register()`
2. Component uses custom props (e.g., `selected`/`onChange`)? → Use `Controller`
3. Component is compound (e.g., Select with Trigger/Options)? → Use `Controller`

**Form Refactoring Checklist**:
- [ ] Import useForm, Controller, zodResolver
- [ ] Create/import Zod schema
- [ ] Replace useState with useForm + zodResolver
- [ ] InputField → spread `{...register('fieldName')}`
- [ ] DatePicker → wrap with `<Controller name="fieldName" />`
- [ ] Select → wrap with `<Controller name="fieldName" />`
- [ ] Update form submit: `<form onSubmit={form.handleSubmit(onSubmit)}>`
- [ ] Update errors: `form.formState.errors.fieldName?.message`
- [ ] Convert Date → ISO string in onSubmit handler (if API expects strings)

