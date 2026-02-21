# Missionary Admin CLAUDE.md

이 파일은 `packages/client/missionary-admin/**` 전용 규칙이다. 상위 규칙은 `../CLAUDE.md`를 따른다.

## Overview

`missionary-admin`은 관리자용 Next.js App Router 앱이다. 미션/그룹 관리 도메인 라우트가 핵심이며, 서버 액션과 클라이언트 mutation이 함께 사용된다.

## Entry Points

- `src/app/layout.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/page.tsx`
- `src/proxy.ts`

## Conventions

- 미션 도메인 코드는 `src/app/(admin)/missions/**`에 코로케이션한다.
- 라우트별 `_components`, `_hooks`, `_schemas`, `_actions`, `_utils` 분리를 유지한다.
- 인증/쿼리 provider 패턴은 `src/lib` 계층에서 유지한다.
- 관리자 전용 스타일은 `src/styles/**`에서 관리한다.
- 테스트는 Vitest(`vitest.config.ts`, `src/test/setup.ts`) 기준으로 추가한다.

## Where To Look

| Task                  | Location                                                              | Notes             |
| --------------------- | --------------------------------------------------------------------- | ----------------- |
| Admin layout shell    | `src/app/(admin)/layout.tsx`, `src/app/(admin)/AdminLayoutClient.tsx` | Sidebar/Header    |
| Mission domain routes | `src/app/(admin)/missions`                                            | 핵심 비즈니스     |
| Server actions        | `src/app/**/_actions`                                                 | `use server` 경계 |
| Domain APIs           | `src/apis/missionary.ts`, `src/apis/missionGroup.ts`                  | 관리자 API        |
| Styles                | `src/styles`                                                          | admin 전용 스타일 |

## Anti-Patterns

- `missions` 도메인 로직을 라우트 외부로 분산시키지 않는다.
- 서버 액션 경계(`use server`)를 클라이언트 컴포넌트에서 우회하지 않는다.
- 관리자 전용 API 타입/스키마를 사용자 앱과 혼합하지 않는다.
- 인증 진입 규칙(`src/proxy.ts`)과 다른 별도 진입 가드를 중복 생성하지 않는다.

## Commands

```bash
pnpm --filter missionary-admin dev
pnpm --filter missionary-admin build
pnpm --filter missionary-admin test
pnpm --filter missionary-admin test:watch
```
