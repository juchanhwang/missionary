# Draft: 디자인 시스템 RHF 호환성 개선

## Requirements (confirmed)

- 모든 폼 컴포넌트를 `{...register('name')}` 패턴으로 사용하고 싶다
- DatePicker, Select이 가장 큰 pain point
- Breaking Change 허용 (기존 API 호환 불필요)

## 현재 상태 분석

### register() 호환 가능 (이미 동작)

- **InputField**: `InputHTMLAttributes<HTMLInputElement>` 확장, 네이티브 `<input>` 직접 렌더링 → register() 정상 동작

### register() 호환 불가 (custom onChange 시그니처)

- **Checkbox**: `onChange: (checked: boolean) => void` — hidden input, div에서 click 처리
- **Radio**: `onChange: (checked: boolean) => void` — hidden input, div에서 click 처리
- **Switch**: `onChange: (checked: boolean) => void` — hidden input, div에서 click 처리
- **CheckboxGroup**: `onChange: (value: string[]) => void`
- **RadioGroup**: `onChange: (value: string) => void`

### register() 근본적 불가 (네이티브 input 없음)

- **Select**: compound component, 네이티브 `<select>` 없음, `onChange: (value?: ValueType) => void`
- **DatePicker**: react-datepicker 래퍼, `onChange: (date: Date | null) => void`

## Technical Decisions

- React 19 사용 중 → forwardRef 대신 ref를 일반 prop으로 사용 (이미 적용됨)

## Technical Decisions

- DS는 RHF에 대한 의존성 없이 유지
- register() 불가한 컴포넌트(Select, DatePicker)는 Controller 사용 허용
- Breaking Change 허용

## 전략 정리

### register() 호환으로 변경할 컴포넌트

- Checkbox, Radio, Switch: 네이티브 input 이벤트 핸들링 수정
- CheckboxGroup, RadioGroup: 값 기반이라 Controller 영역일 수 있음 (확인 필요)

### Controller 유지하되 DX 개선할 컴포넌트

- Select: compound component, register() 불가
- DatePicker: react-datepicker 래퍼, register() 불가
- → `{...field}` spread가 바로 동작하도록 API 개선 가능 (예: DatePicker의 `selected` → `value`로 변경)

## Test Strategy Decision

- **Infrastructure exists**: YES (Vitest 4.0.18 + React Testing Library 설정됨)
- **Design system에 테스트 파일**: 0개 (config만 있고 test script/test 파일 없음)
- **Automated tests**: YES (Tests-after) — 컴포넌트 수정 후 RHF 호환성 테스트 작성
- **Framework**: Vitest + @testing-library/react (기존 패턴 따름)
- **Agent-Executed QA**: Storybook + Playwright 확인

## Resolved Questions

- Select/DatePicker: Controller `{...field}` 스프레드 지원으로 DX 개선 (selected→value 등)
- 테스트: 포함 (TDD가 아닌 구현 후 테스트)
- DS에 test script 추가 필요

## Scope Boundaries

- INCLUDE: 디자인 시스템 폼 컴포넌트 전체 (Checkbox, Radio, Switch, Select, DatePicker, CheckboxGroup, RadioGroup)
- EXCLUDE: InputField (이미 호환), DS 외부 코드 변경은 최소화
