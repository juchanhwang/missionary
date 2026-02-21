# Design System CLAUDE.md

이 파일은 `packages/client/design-system/**` 전용 규칙이다. 상위 규칙은 `../CLAUDE.md`를 따른다.

## Overview

`@samilhero/design-system`은 공통 UI 라이브러리다. `vite build` 결과를 `dist/`로 배포하며, 앱은 `workspace:*`로 이 패키지를 소비한다.

## Structure

```text
src/
├── components/     # 컴포넌트 단위 디렉토리 (index.tsx, stories, tests)
├── hooks/
├── overlay/
├── styles/
└── index.tsx       # 공개 API 엔트리
```

## Conventions

- 컴포넌트는 `components/<name>/index.tsx` 중심 패턴을 유지한다.
- 복합 컴포넌트는 context + action/data 분리 패턴을 따른다.
- `src/index.tsx`가 공개 API 경계이므로 export 변경 시 앱 영향 범위를 확인한다.
- 테스트는 Vitest(`jsdom`, `vitest.setup.ts`)를 사용한다.
- build 타입 생성은 `vite-plugin-dts` 설정을 따른다(`stories`/`tests`는 d.ts 생성 제외).

## Where To Look

| Task           | Location                              | Notes                             |
| -------------- | ------------------------------------- | --------------------------------- |
| Public exports | `src/index.tsx`                       | 배포 API 경계                     |
| Build config   | `vite.config.ts`                      | alias, external, dts              |
| Test config    | `vitest.config.ts`, `vitest.setup.ts` | jsdom + mocking                   |
| Package output | `package.json`                        | `exports`, `types`, `sideEffects` |

## Anti-Patterns

- `dist/`, `storybook-static/`를 수정하지 않는다.
- 앱 전용 로직(`missionary-app`, `missionary-admin`)을 디자인시스템에 넣지 않는다.
- alias 규칙(`@assets`, `@components`, `@hooks` 등)을 깨는 경로를 추가하지 않는다.
- 공용 컴포넌트의 breaking change를 `src/index.tsx` export 확인 없이 반영하지 않는다.

## Commands

```bash
pnpm --filter design-system build
pnpm --filter design-system test
pnpm --filter design-system test:watch
pnpm --filter design-system storybook
```
