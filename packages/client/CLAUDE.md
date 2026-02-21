# Client (Frontend) CLAUDE.md

이 파일은 `packages/client/**` 공통 규칙이다. 루트 규칙은 `../../CLAUDE.md`를 따른다.

## Scope

다음 하위 패키지 전반에 적용된다.

- `design-system`
- `missionary-app`
- `missionary-admin`

## Child CLAUDE Files

세부 규칙은 각 패키지 문서를 우선한다.

- `./design-system/CLAUDE.md`
- `./missionary-app/CLAUDE.md`
- `./missionary-admin/CLAUDE.md`

## Shared Stack

- React 19
- TypeScript 5.9 (`moduleResolution: bundler`)
- Tailwind CSS 4
- Vitest + jsdom

## Shared Architecture

- Next 앱은 App Router + 라우트 코로케이션 패턴을 사용한다.
- 라우트 전용 로직은 `app/**/_hooks`, `app/**/_components`, `app/**/_schemas`, `app/**/_types`에 둔다.
- 공통 UI/경계 컴포넌트는 `components/`, 데이터 접근은 `apis/`, 상태/컨텍스트는 `lib/`/`hooks/`로 분리한다.

## Shared Conventions

- 앱 패키지는 design-system 소스를 alias로 참조한다.
  - `missionary-app`: `@* -> ../design-system/src/*`
  - `missionary-admin`: `@* -> ../design-system/src/*`
- Vitest 환경은 `jsdom` + `globals: true`를 사용한다.
- 테스트 파일은 `__tests__` 디렉토리 또는 `*.test.ts(x)`를 사용한다.
- React 19 기준으로 신규 컴포넌트는 `forwardRef`보다 `ref` prop 패턴을 우선한다.

## Where To Look

| Task                 | Location                                                                                | Notes               |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| Shared UI API        | `design-system/src/index.tsx`                                                           | export 경계         |
| App routing          | `missionary-app/src/app`, `missionary-admin/src/app`                                    | 도메인 코로케이션   |
| Frontend test setup  | `missionary-app/src/test`, `missionary-admin/src/test`, `design-system/vitest.setup.ts` | jsdom 공통          |
| Query/Auth providers | `*/src/lib`                                                                             | app별 provider 분리 |

## Anti-Patterns

- `dist/`, `storybook-static/`를 수정 대상으로 취급하지 않는다.
- 라우트 전용 코드(`app/**`)를 루트 공용 영역으로 무분별하게 끌어올리지 않는다.
- alias 규칙을 깨고 상대경로 지옥을 만들지 않는다.
- 클라이언트 패키지에서 서버 패키지 내부 구현을 직접 참조하지 않는다.

## Commands

```bash
# app
pnpm --filter missionary-app dev
pnpm --filter missionary-app test:run

# admin
pnpm --filter missionary-admin dev
pnpm --filter missionary-admin test

# design system
pnpm --filter design-system storybook
pnpm --filter design-system test
```

## Quality Principle

복잡한 UI 변경 시 `frontend-code-quality` 스킬 기준(가독성, 예측 가능성, 응집도, 결합도)을 우선 적용한다.
