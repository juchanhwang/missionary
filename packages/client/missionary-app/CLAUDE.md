# Missionary App CLAUDE.md

이 파일은 `packages/client/missionary-app/**` 전용 규칙이다. 상위 규칙은 `../CLAUDE.md`를 따른다.

## Overview

`missionary-app`은 사용자용 Next.js App Router 앱이다. 인증 상태에 따라 공개/보호 라우트를 분기한다.

## Entry Points

- `src/app/layout.tsx`
- `src/app/(main)/layout.tsx`
- `src/app/(main)/page.tsx`
- `src/middleware.ts`

## Conventions

- 라우트 코로케이션 패턴(`_components`, `_hooks`, `_schemas`, `_types`)을 유지한다.
- 인증 가드는 `src/middleware.ts` 경로 규칙과 일치시킨다.
- React Query provider/auth context 조합은 `src/lib` 계층에서 유지한다.
- 디자인시스템은 alias(`@* -> ../design-system/src/*`) 기반으로 사용한다.
- 테스트는 Vitest(`vitest.config.ts`, `src/test/setup.ts`) 기준으로 추가한다.

## Where To Look

| Task               | Location                         | Notes                            |
| ------------------ | -------------------------------- | -------------------------------- |
| Route layouts      | `src/app/**/layout.tsx`          | SSR 경계                         |
| Auth hooks/context | `src/hooks/auth`, `src/lib/auth` | 로그인/로그아웃                  |
| API clients        | `src/apis`                       | axios instance + server instance |
| Query keys         | `src/lib/queryKeys.ts`           | 캐시 일관성                      |
| Tests              | `src/test`, `src/**/__tests__`   | `.test.ts(x)`                    |

## Anti-Patterns

- 공개/보호 라우트 규칙을 middleware와 별개로 중복 구현하지 않는다.
- 디자인시스템 컴포넌트를 앱 내부에서 임의 복제하지 않는다.
- 라우트 전용 코드를 공용 디렉토리로 무리하게 이동시키지 않는다.
- 테스트 setup(`src/test/setup.ts`) 없이 DOM 환경 의존 테스트를 추가하지 않는다.

## Commands

```bash
pnpm --filter missionary-app dev
pnpm --filter missionary-app build
pnpm --filter missionary-app test
pnpm --filter missionary-app test:run
```
